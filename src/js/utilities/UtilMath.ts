export class UtilMath {

  public static clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  public static between(value: number, min: number, max: number): boolean {
    return min <= value && max >= value;
  }

  public static isNumeric(value: string): boolean {
    return !isNaN(Number(value));
  }

  public static round(num: number, decimal = 2): number {
    if (decimal == 0) return parseInt(num.toFixed(decimal));
    else return parseFloat(num.toFixed(decimal));
  }

  public static rangeIterable(min: number, max: number, isExclusive = true) {
    if (!(min < max)) [min, max] = [max, min];
    return {[Symbol.iterator]: () => ({ next: () => ({ done: min > max || (isExclusive && min === max), value: min++ }) })};
  }

}

/**
 * Tagged template literal to make a range iterator following [Ruby's
 * syntax](https://docs.ruby-lang.org/en/master/Range.html).
 *
 * `...` for exclusive max, `..` for inclusive max.
 * 
 * Will correctly parse fully & partially explicit string parameters (e.g.
 * `2..${10}` will use `2` & `10` for the start & end of the range respectively).
 */
export function range(strings: TemplateStringsArray, min?: number, max?: number): Iterable<number> {
  const isExclusive = strings.some(e => e.includes("..."));
  // Inverts cases like `2..${10}`
  if (min !== undefined && max === undefined && strings[0].endsWith("..")) [min, max] = [max, min];
  min ??= parseFloat(strings[0].match(/^([-+]?[0-9]*\.?[0-9]+)/)?.[0] ?? "NaN");
  max ??= parseFloat(strings[strings.length - 1].match(/[-+]?[0-9]*(?:(?<!\.)\.)?[0-9]+$/)?.[0] ?? "NaN");
  if (isNaN(min) || isNaN(max)) throw new SyntaxError(`Could not extract a non-NaN value for 'm${isNaN(min) ? "in" : "ax"}'`);
  if (min > max) [min, max] = [max, min];
  return {[Symbol.iterator]: () => ({ next: () => ({ done: min! > max || (isExclusive && min === max), value: min!++ }) })};
}
