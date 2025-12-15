// adjust final result based on original sign of n
// if n was negative, return negative sum, otherwise return positive sum.
const applySign = (n: number, sum: number) => (n < 0 ? -sum : sum);

// 3 functions bellow use Math.abs and applySign to support negative n
// Note: Assuming this input n will always produce a result lesser than Number.MAX_SAFE_INTEGER as the requirement stated.

// 1. using for loop
const sum_to_n_a = function(n: number) {
    // use positive number
    let absN = Math.abs(n);
    let sum = 0;
    // sum 1 + 2 + ... + absN
    for (let i = 1; i <= absN; i++) {
        sum += i;
    }

    // reapply original sign of n for correct sign of sum
    return applySign(n, sum);
};

// 2. using while loop
const sum_to_n_b = function(n: number) {
    // use positive number
    let absN = Math.abs(n);
    let sum = 0;
    let current = absN;

    // sum absN + (absN-1) + ... + 1
    while (current >= 1) {
        sum += current;
        current--;
    }

    // reapply original sign of n for correct sum
    return applySign(n, sum);
};

// 3. using recursive function
const sum_to_n_c = function(n: number) {
    // use positive number
    let absN = Math.abs(n);

    // Base case: sum to 1 is 1
    if (absN <= 1) return 1;
    
    // Recursive case: n + sum(n-1)
    const sum: number = absN + sum_to_n_c(absN-1);

    // reapply original sign of n for correct sum
    return applySign(n, sum);
};

function main() {
    const n = 5;
    const sumA = sum_to_n_a(n);
    const sumB = sum_to_n_b(n);
    const sumC = sum_to_n_c(n);
    console.log("sumA", sumA);
    console.log("sumB", sumB);
    console.log("sumC", sumC);
}

main();