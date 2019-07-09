export function parseNumber(data: string | number): { datapoints: [number[]] } {
  return { datapoints: [[Number(data), Date.now()]] };
}

export function parseString(data: string): { datapoints: [[string, number]] } {
  return { datapoints: [[data, Date.now()]] };
}
