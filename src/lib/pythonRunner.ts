/**
 * Python Calculation Runner
 * ==========================
 * Utility to execute Python calculations from Node.js/Next.js
 */

import { spawn } from 'child_process';
import path from 'path';

export interface PortfolioInput {
  allocation: Record<string, number>;
  totalInvestment: number;
  monthlyContribution?: number;
  investmentHorizon?: number;
  riskFreeRate?: number;
  targetReturn?: number;
}

export interface CalculationResult {
  success: boolean;
  data?: any;
  error?: string;
}

const PYTHON_PATH = 'python'; // or 'python3' depending on system
const CALCULATIONS_DIR = path.join(process.cwd(), 'calculations');

/**
 * Run Python calculation script with given input
 */
export async function runPythonCalculation(
  scriptName: string,
  input: PortfolioInput
): Promise<CalculationResult> {
  return new Promise((resolve) => {
    const scriptPath = path.join(CALCULATIONS_DIR, scriptName);
    
    const pythonProcess = spawn(PYTHON_PATH, [
      '-c',
      `
import sys
import json
from calculator import run_full_calculation

# Read input from stdin
input_data = json.loads(sys.stdin.read())

# Run calculation
result = run_full_calculation(
    allocation=input_data['allocation'],
    total_investment=input_data['totalInvestment'],
    monthly_contribution=input_data.get('monthlyContribution', 0),
    investment_horizon=input_data.get('investmentHorizon', 10),
    risk_free_rate=input_data.get('riskFreeRate', 4.5)
)

# Output JSON result
print(json.dumps(result))
      `
    ], {
      cwd: CALCULATIONS_DIR,
      env: {
        ...process.env,
        PYTHONPATH: CALCULATIONS_DIR,
      },
    });

    let output = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        resolve({
          success: false,
          error: `Python process exited with code ${code}: ${errorOutput}`,
        });
        return;
      }

      try {
        const result = JSON.parse(output);
        resolve({ success: true, data: result });
      } catch (e: any) {
        resolve({
          success: false,
          error: `Failed to parse Python output: ${e.message}`,
        });
      }
    });

    // Send input to Python process
    pythonProcess.stdin.write(JSON.stringify(input));
    pythonProcess.stdin.end();
  });
}

/**
 * Run calculation using the main calculator module
 */
export async function calculatePortfolioMetrics(
  input: PortfolioInput
): Promise<CalculationResult> {
  return runPythonCalculation('calculator.py', input);
}

/**
 * Alternative: Use shell execution with temporary JSON files
 * (Useful for larger inputs or if stdin method has issues)
 */
export async function runPythonCalculationWithFile(
  input: PortfolioInput
): Promise<CalculationResult> {
  const fs = await import('fs/promises');
  const os = await import('os');
  const crypto = await import('crypto');
  
  const tempDir = os.tmpdir();
  const id = crypto.randomUUID();
  const inputFile = path.join(tempDir, `calc_input_${id}.json`);
  const outputFile = path.join(tempDir, `calc_output_${id}.json`);

  try {
    // Write input to temp file
    await fs.writeFile(inputFile, JSON.stringify(input));

    // Run Python script
    const { exec } = await import('child_process');
    const util = await import('util');
    const execAsync = util.promisify(exec);

    const pythonScript = `
import json
import sys
sys.path.insert(0, '${CALCULATIONS_DIR.replace(/\\/g, '\\\\')}')

from calculator import run_full_calculation

with open('${inputFile.replace(/\\/g, '\\\\')}', 'r') as f:
    input_data = json.load(f)

result = run_full_calculation(
    allocation=input_data['allocation'],
    total_investment=input_data['totalInvestment'],
    monthly_contribution=input_data.get('monthlyContribution', 0),
    investment_horizon=input_data.get('investmentHorizon', 10),
    risk_free_rate=input_data.get('riskFreeRate', 4.5)
)

with open('${outputFile.replace(/\\/g, '\\\\')}', 'w') as f:
    json.dump(result, f)
    `;

    await execAsync(`${PYTHON_PATH} -c "${pythonScript}"`);

    // Read output
    const output = await fs.readFile(outputFile, 'utf-8');
    const result = JSON.parse(output);

    return { success: true, data: result };
  } catch (error: any) {
    return {
      success: false,
      error: `Calculation failed: ${error.message}`,
    };
  } finally {
    // Cleanup temp files
    try {
      await fs.unlink(inputFile);
      await fs.unlink(outputFile);
    } catch {
      // Ignore cleanup errors
    }
  }
}
