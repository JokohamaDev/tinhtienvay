document.getElementById('btn_about').onclick = function () {
    document.getElementById('overlay').style.display = 'block';
}
document.getElementById('close_about').onclick = function () {
    document.getElementById('overlay').style.display = 'none';
}

window.onclick = function (event) {
    if (event.target === document.getElementById('overlay')) {
        document.getElementById('overlay').style.display = 'none';
    }
}

const requiredInputs = document.querySelectorAll("#my-form input[required]");
document.querySelector("#my-form input[type=button]").addEventListener("click", () => {
    requiredInputs.forEach(input => {
        if (input.value.trim() === "" || input.value === "0") {
            input.classList.add("input-error");
        }
    })
})

const promoInputs = document.querySelectorAll("#f-promo-interest, #f-promo-duration");
document.querySelector("#my-form input[type=button]").addEventListener("click", () => {
    promoInputs.forEach(input => {
        if (input.value.trim() === "0" || input.value.trim() === "0.0") {
            input.classList.add("input-error");
        }
    })
})

function use_number(node) {
    node.classList.remove("input-error");
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
        const promoInterestElement = document.getElementById('f-promo-interest');
        const promoDurationElement = document.getElementById('f-promo-duration');
        const promoMonthlyElement = document.getElementById('f-promo-monthly');

        if (!amountElement || !interestElement || !tenorElement || !total1Element || !monthlyElement || !total2Element || !firstMonthElement || !lastMonthElement) {
            throw new Error("Missing form elements");
        }

        const amount = Number(amountElement.value.replace(/,/g, ''));
        const interest = Number(interestElement.value);
        const tenor = Number(tenorElement.value);
        const promoInterest = Number(promoInterestElement.value);
        const promoDuration = Number(promoDurationElement.value);

        if (isNaN(amount) || isNaN(interest) || isNaN(tenor)) {
            throw new Error("Invalid input values");
        }

        if (amount <= 0) {
            throw new Error("Amount must be greater than 0");
        }

        if (interest <= 0) {
            throw new Error("Interest rate must be greater than 0");
        }

        if (tenor <= 0) {
            throw new Error("Tenor must be greater than 0");
        }

        if (promoInterestElement.value !== '' && promoInterest <= 0) {
            throw new Error("Promotion interest rate must be greater than 0");
        }

        if (promoDurationElement.value !== '' && promoDuration <= 0) {
            throw new Error("Promotion duration must be greater than 0");
        }

        // Payment cố định theo số nợ ban đầu
        let interest_rate = interest / 1200;
        let promo_interest_rate = promoInterest / 1200;

        let monthly_payment = amount * Math.pow(1.0 + interest_rate, tenor) * interest_rate / (Math.pow(1.0 + interest_rate, tenor) - 1.0);
        let monthly_promo_payment = amount * Math.pow(1.0 + promo_interest_rate, tenor) * promo_interest_rate / (Math.pow(1.0 + promo_interest_rate, tenor) - 1.0);
        let rounded_monthly = Math.round(monthly_payment) || 0;
        monthlyElement.value = rounded_monthly.toLocaleString('en');
        let rounded_promo_monthly = Math.round(monthly_promo_payment) || 0;
        promoMonthlyElement.value = rounded_promo_monthly.toLocaleString('en');
        let total = 0;
        let remaining_tenor = tenor;
        if (promoInterest !== 0 && promoDuration !== 0 && promoDuration < tenor) {
            total += monthly_promo_payment * promoDuration;
            remaining_tenor -= promoDuration;
        }
        total += monthly_payment * remaining_tenor;

        let rounded_total = Math.round(total) || 0;
        total1Element.value = rounded_total.toLocaleString('en');

        // Payment giảm dần dựa trên dư nợ
        let total_decreasing = 0;
        let outstanding_balance = amount;
        for (let i = 0; i < tenor; i++) {
            let interest_rate_used = (promoInterest === 0 || promoDuration === 0 || i >= promoDuration) ? interest_rate : promoInterest / 1200;
            let payment_decreasing = amount / tenor + outstanding_balance * interest_rate_used;
            total_decreasing += payment_decreasing;
            outstanding_balance -= amount / tenor;
            if (i == 0) {
                let first_month_decreasing = payment_decreasing;
                let rounded_first_month_decreasing = Math.round(first_month_decreasing) || 0;
                firstMonthElement.value = rounded_first_month_decreasing.toLocaleString('en');
            }
            if (i == tenor - 1) {
                let last_month_decreasing = payment_decreasing;
                let rounded_last_month_decreasing = Math.round(last_month_decreasing) || 0;
                lastMonthElement.value = rounded_last_month_decreasing.toLocaleString('en');
            }
        }
        let rounded_total_decreasing = Math.round(total_decreasing) || 0;
        total2Element.value = rounded_total_decreasing.toLocaleString('en');

        // let first_month_decreasing = amount * interest_rate;
        // let rounded_first_month_decreasing = Math.round(first_month_decreasing) || 0;
        // firstMonthElement.value += '\n' + rounded_first_month_decreasing.toLocaleString('en');

        // let last_month_decreasing = outstanding_balance * interest_rate;
        // let rounded_last_month_decreasing = Math.round(last_month_decreasing) || 0;
        // lastMonthElement.value += '\n' + rounded_last_month_decreasing.toLocaleString('en');

        // chart
        const ctx = document.getElementById('myChart').getContext('2d');
        let data1 = Array(tenor).fill(0).map((_, i) => {
            if (promoInterest !== 0) {
                return i < promoDuration ? Math.round(monthly_promo_payment) || 0 : Math.round(monthly_payment) || 0;
            }
            else {
                return Math.round(monthly_payment) || 0;
            }
        });
        let data2 = [];

        let outstanding_balance2 = amount;
        for (let i = 0; i < tenor; i++) {
            let interest_rate_used = (promoInterest === 0 || promoDuration === 0 || i >= promoDuration) ? interest_rate : promoInterest / 1200;
            let payment_decreasing = amount / tenor + outstanding_balance2 * interest_rate_used;
            let rounded_payment_decreasing = Math.round(payment_decreasing) || 0;
            data2.push(rounded_payment_decreasing);
            outstanding_balance2 -= amount / tenor;
        }
        let chartStatus = Chart.getChart("myChart");
        if (chartStatus != undefined) {
            chartStatus.destroy();
        }
        let myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [...Array(tenor).keys()].map(i => i + 1),
                datasets: [
                    {
                        label: 'Trả lãi cố định theo dư nợ ban đầu',
                        data: data1,
                        borderColor: 'hsl(200, 42%, 69%)',
                        backgroundColor: 'hsl(200, 42%, 69%)',
                    },
                    {
                        label: 'Trả lãi dựa trên dư nợ giảm dần',
                        data: data2,
                        borderColor: 'hsl(270, 42%, 69%)',
                        backgroundColor: 'hsl(270, 42%, 69%)',
                    }
                ]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: false
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Thời gian (tháng thứ n)',
                        }
                    }
                },
                responsive: true,
                maintainAspectRatio: false,
            },
            plugins: [{
                id: 'removePlaceholder',
                beforeRender: function (chart) {
                    document.getElementById('chart_placeholder').style.display = 'none';
                    document.getElementById('myChart').style.display = 'block';
                }
            }]
        });

    } catch (error) {
        console.error("Error calculating payment:", error.message);
        throw error;
    }
}
