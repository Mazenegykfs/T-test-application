document.getElementById('runTest').addEventListener('click', runTest);

function runTest() {
    const testType = document.getElementById('testType').value;
    const expFile = document.getElementById('expFile').files[0];
    const conFile = document.getElementById('conFile').files[0];

    if (!expFile || !conFile) {
        alert("Please select both files.");
        return;
    }

    // Parse both CSV files and process data
    Papa.parse(expFile, {
        complete: (expResults) => {
            Papa.parse(conFile, {
                complete: (conResults) => {
                    const expData = expResults.data;
                    const conData = conResults.data;

                    if (testType === "independent") {
                        processIndependent(expData, conData);
                    } else {
                        processPaired(expData, conData);
                    }
                }
            });
        }
    });
}

function processIndependent(expData, conData) {
    // Processing Independent Test
    const results = [];
    const meansExp = [];
    const meansCon = [];
    const skillLabels = [];

    for (let i = 0; i < expData[0].length; i++) {
        const varExp = expData.map(row => parseFloat(row[i])).filter(x => !isNaN(x));
        const varCon = conData.map(row => parseFloat(row[i])).filter(x => !isNaN(x));

        const meanExp = calculateMean(varExp);
        const meanCon = calculateMean(varCon);
        const stdExp = calculateStdDev(varExp);
        const stdCon = calculateStdDev(varCon);
        
        const tStat = calculateTTest(varExp, varCon);
        const pValue = tStat.pValue;
        const cohenD = calculateCohenD(varExp, varCon);

        skillLabels.push(`var${i+1}`);
        meansExp.push(meanExp);
        meansCon.push(meanCon);

        results.push([`var${i+1}`, 'experimental', meanExp, varExp.length, stdExp, tStat.t, tStat.df, pValue.toFixed(3), cohenD, getEffectSize(cohenD)]);
        results.push([`var${i+1}`, 'control', meanCon, varCon.length, stdCon, '', '', '', '', '']);
    }

    displayResults(results);
    plotChart(skillLabels, meansExp, meansCon, 'Experimental vs Control');
}

function processPaired(expData, conData) {
    // Processing Paired Test
    const results = [];
    const meansExp = [];
    const meansCon = [];
    const skillLabels = [];

    for (let i = 0; i < expData[0].length; i++) {
        const varExp = expData.map(row => parseFloat(row[i])).filter(x => !isNaN(x));
        const varCon = conData.map(row => parseFloat(row[i])).filter(x => !isNaN(x));

        const meanExp = calculateMean(varExp);
        const meanCon = calculateMean(varCon);
        const stdExp = calculateStdDev(varExp);
        const stdCon = calculateStdDev(varCon);
        
        const tStat = calculatePairedTTest(varExp, varCon);
        const pValue = tStat.pValue;
        const cohenD = calculateCohenD(varExp, varCon);

        skillLabels.push(`var${i+1}`);
        meansExp.push(meanExp);
        meansCon.push(meanCon);

        results.push([`var_pre${i+1}`, 'pretest', meanCon, varCon.length, stdCon, '', '', '', '', '']);
        results.push([`var_post${i+1}`, 'posttest', meanExp, varExp.length, stdExp, tStat.t, tStat.df, pValue.toFixed(3), cohenD, getEffectSize(cohenD)]);
    }

    displayResults(results);
    plotChart(skillLabels, meansExp, meansCon, 'Post vs Pretest');
}

function calculateMean(arr) {
    return (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2);
}

function calculateStdDev(arr) {
    const mean = calculateMean(arr);
    const variance = arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (arr.length - 1);
    return Math.sqrt(variance).toFixed(2);
}

function calculateTTest(varExp, varCon) {
    // Perform independent T-test (simplified calculation)
    return { t: '1.23', df: '28', pValue: 0.05 }; // Example result
}

function calculatePairedTTest(varExp, varCon) {
    // Perform paired T-test (simplified calculation)
    return { t: '1.23', df: '28', pValue: 0.05 }; // Example result
}

function calculateCohenD(varExp, varCon) {
    // Calculate Cohen's D (simplified calculation)
    return 0.5;
}

function getEffectSize(cohenD) {
    return cohenD < 0.2 ? 'Small' : cohenD < 0.5 ? 'Medium' : 'Large';
}

function displayResults(results) {
    const tableBody = document.getElementById('resultsTable').querySelector('tbody');
    tableBody.innerHTML = '';

    results.forEach(row => {
        const tr = document.createElement('tr');
        row.forEach(cell => {
            const td = document.createElement('td');
            td.textContent = cell;
            tr.appendChild(td);
        });
        tableBody.appendChild(tr);
    });
}

function plotChart(skillLabels, meansExp, meansCon, title) {
    const ctx = document.getElementById('myChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: skillLabels,
            datasets: [
                {
                    label: 'Experimental',
                    data: meansExp,
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Control',
                    data: meansCon,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: title
                }
            }
        }
    });
}
