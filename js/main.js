

function use_number(node) {
    var empty_val = false;
    const value = node.value;
    if (node.value == '')
      empty_val = true;
    node.type = 'number';
    if (!empty_val)
      node.value = Number(value.replace(/,/g, '')); // or equivalent per locale
}
  
function use_text(node) {
    var empty_val = false;
    const value = Number(node.value);
    if (node.value == '')
      empty_val = true;
    node.type = 'text';
    if (!empty_val)
      node.value = value.toLocaleString('en');  // or other formatting
}

function checkMaxTenor(input) {
    if (input.value > 360) {
      input.value = 360;
    }
}
function checkMaxInterest(input) {
    input.type = 'number';
    if (input.value > 100) {
      input.value = 100;
    }
}

function formatDecimal(input) {
    if (input == null || input.value == null) {
        throw new Error("Input is null");
    }

    try {
        // Ensure the value always has one decimal place
        input.value = parseFloat(input.value).toFixed(1);
        // Ensure the value always has one decimal place and uses a dot as the separator
        input.type = 'text';
        input.value = input.value.replace(',', '.');
    } catch (error) {
        console.error("Error formatting decimal", error);
    }
}

function calculate() {
    try {
        const amountElement = document.getElementById('f-amount');
        const interestElement = document.getElementById('f-interest');
        const tenorElement = document.getElementById('f-tenor');
        const total1Element = document.getElementById('f-total1');
        const monthlyElement = document.getElementById('f-monthly');
        const total2Element = document.getElementById('f-total2');
        const firstMonthElement = document.getElementById('f-first-month');
        const lastMonthElement = document.getElementById('f-last-month');

        if (!amountElement || !interestElement || !tenorElement || !total1Element || !monthlyElement || !total2Element || !firstMonthElement || !lastMonthElement) {
            throw new Error("Missing form elements");
        }

        const amount = Number(amountElement.value.replace(/,/g, ''));
        const interest = Number(interestElement.value);
        const tenor = Number(tenorElement.value);

        if (isNaN(amount) || isNaN(interest) || isNaN(tenor)) {
            throw new Error("Invalid input values");
        }

        let interest_rate = interest / 1200;
        let monthly_payment = amount * Math.pow(1.0 + interest_rate, tenor) * interest_rate / (Math.pow(1.0 + interest_rate, tenor) - 1.0);
        let rounded_monthly = Math.round(monthly_payment) || 0;
        monthlyElement.value = rounded_monthly.toLocaleString('en');
        let total = monthly_payment * tenor;

        let rounded_total = Math.round(total) || 0;
        total1Element.value = rounded_total.toLocaleString('en');

        // Lãi suất dựa trên dư nợ giảm dần
        let total_decreasing = 0;
        let outstanding_balance = amount;
        for (let i = 0; i < tenor; i++) {
            let monthly_payment_decreasing = outstanding_balance * interest/100;
            total_decreasing += monthly_payment_decreasing;
            outstanding_balance -= monthly_payment_decreasing;
        }
        let rounded_total_decreasing = Math.round(total_decreasing) || 0;
        total2Element.value += '\n' + rounded_total_decreasing.toLocaleString('en');

        let first_month_decreasing = amount * interest_rate;
        let rounded_first_month_decreasing = Math.round(first_month_decreasing) || 0;
        firstMonthElement.value += '\n' + rounded_first_month_decreasing.toLocaleString('en');

        let last_month_decreasing = outstanding_balance * interest_rate;
        let rounded_last_month_decreasing = Math.round(last_month_decreasing) || 0;
        lastMonthElement.value += '\n' + rounded_last_month_decreasing.toLocaleString('en');

    } catch (error) {
        console.error("Error calculating payment:", error.message);
        throw error;
    }
}
