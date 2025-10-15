// ===================================
// Canvas Chart Rendering
// ===================================

/**
 * Draw loan repayment schedule chart
 * @param {string} canvasId - Canvas element ID
 * @param {Array} schedule - Repayment schedule data
 * @param {number} principal - Loan principal amount
 */
function drawLoanChart(canvasId, schedule, principal) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Set canvas size (responsive)
    const container = canvas.parentElement;
    const width = container.clientWidth;
    const height = Math.min(400, width * 0.6);
    
    canvas.width = width;
    canvas.height = height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Chart dimensions
    const padding = 60;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    
    // Calculate max value for Y axis
    const maxPayment = Math.max(...schedule.map(s => s.payment));
    const yMax = Math.ceil(maxPayment / 100000) * 100000; // Round up to nearest 100k
    
    // Number of bars to display (sample if too many)
    const maxBars = width > 768 ? 24 : 12;
    const displaySchedule = schedule.length > maxBars 
        ? sampleSchedule(schedule, maxBars)
        : schedule;
    
    const barWidth = chartWidth / displaySchedule.length;
    const barGap = barWidth * 0.2;
    const actualBarWidth = barWidth - barGap;
    
    // Draw chart background with subtle gradient
    const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, '#FAFAFA');
    bgGradient.addColorStop(1, '#F5F5F5');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);
    
    // Draw chart area background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(padding, padding, chartWidth, chartHeight);
    
    // Draw grid lines with better styling
    ctx.strokeStyle = '#E8E8E8';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]); // Dashed lines for subtlety
    
    for (let i = 0; i <= 5; i++) {
        const y = padding + (chartHeight / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
    }
    
    // Reset line dash
    ctx.setLineDash([]);
    
    // Draw Y axis labels with better styling
    ctx.fillStyle = '#424242';
    ctx.font = 'bold 13px "Noto Sans KR", "Malgun Gothic", "맑은 고딕", "Apple SD Gothic Neo", sans-serif';
    ctx.textAlign = 'right';
    
    for (let i = 0; i <= 5; i++) {
        const value = yMax - (yMax / 5) * i;
        const y = padding + (chartHeight / 5) * i;
        const label = formatChartValue(value);
        
        // Add background for better readability
        const textWidth = ctx.measureText(label).width;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillRect(padding - textWidth - 15, y - 8, textWidth + 10, 16);
        
        ctx.fillStyle = '#424242';
        ctx.fillText(label, padding - 10, y + 4);
    }
    
    // Store bar positions for hover detection
    const barData = [];
    
    // Draw bars (stacked: principal + interest)
    displaySchedule.forEach((item, index) => {
        const x = padding + index * barWidth + barGap / 2;
        
        // Calculate heights
        const principalHeight = (item.principal / yMax) * chartHeight;
        const interestHeight = (item.interest / yMax) * chartHeight;
        
        // Calculate positions
        const interestY = padding + chartHeight - principalHeight - interestHeight;
        const principalY = padding + chartHeight - principalHeight;
        
        // Draw interest (top, vibrant orange with border)
        const interestGradient = ctx.createLinearGradient(x, interestY, x, interestY + interestHeight);
        interestGradient.addColorStop(0, '#FFAB40'); // Light orange
        interestGradient.addColorStop(0.5, '#FF9800'); // Medium orange
        interestGradient.addColorStop(1, '#F57C00'); // Dark orange
        ctx.fillStyle = interestGradient;
        ctx.fillRect(x, interestY, actualBarWidth, interestHeight);
        
        // Add border to interest section
        ctx.strokeStyle = '#E65100';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, interestY, actualBarWidth, interestHeight);
        
        // Draw principal (bottom, vibrant blue with border)
        const principalGradient = ctx.createLinearGradient(x, principalY, x, principalY + principalHeight);
        principalGradient.addColorStop(0, '#66BB6A'); // Light green
        principalGradient.addColorStop(0.5, '#4CAF50'); // Medium green
        principalGradient.addColorStop(1, '#388E3C'); // Dark green
        ctx.fillStyle = principalGradient;
        ctx.fillRect(x, principalY, actualBarWidth, principalHeight);
        
        // Add border to principal section
        ctx.strokeStyle = '#2E7D32';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, principalY, actualBarWidth, principalHeight);
        
        // Store bar data for hover
        barData.push({
            x: x,
            y: interestY,
            width: actualBarWidth,
            height: principalHeight + interestHeight,
            data: item
        });
    });
    
    // Draw X axis labels with better styling
    ctx.fillStyle = '#424242';
    ctx.font = 'bold 12px "Noto Sans KR", "Malgun Gothic", "맑은 고딕", "Apple SD Gothic Neo", sans-serif';
    ctx.textAlign = 'center';
    
    displaySchedule.forEach((item, index) => {
        const x = padding + index * barWidth + barWidth / 2;
        const label = `${item.month}개월`;
        
        // Add background for better readability
        const textWidth = ctx.measureText(label).width;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(x - textWidth/2 - 3, height - padding + 10, textWidth + 6, 16);
        
        ctx.fillStyle = '#424242';
        ctx.fillText(label, x, height - padding + 22);
    });
    
    // Draw axes with better styling
    ctx.strokeStyle = '#212121';
    ctx.lineWidth = 3;
    ctx.beginPath();
    // Y axis
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    // X axis
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();
    
    // Add subtle shadow effect to axes
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding + 1, padding + 1);
    ctx.lineTo(padding + 1, height - padding + 1);
    ctx.lineTo(width - padding + 1, height - padding + 1);
    ctx.stroke();
    
    // Draw legend
    const legendY = 20;
    const legendX = width - padding - 150;
    
    // Principal legend (green)
    const principalLegendGradient = ctx.createLinearGradient(legendX, legendY, legendX + 20, legendY + 15);
    principalLegendGradient.addColorStop(0, '#66BB6A');
    principalLegendGradient.addColorStop(0.5, '#4CAF50');
    principalLegendGradient.addColorStop(1, '#388E3C');
    ctx.fillStyle = principalLegendGradient;
    ctx.fillRect(legendX, legendY, 20, 15);
    ctx.strokeStyle = '#2E7D32';
    ctx.lineWidth = 1;
    ctx.strokeRect(legendX, legendY, 20, 15);
    ctx.fillStyle = '#212121';
    ctx.font = 'bold 14px "Noto Sans KR", "Malgun Gothic", "맑은 고딕", "Apple SD Gothic Neo", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('원금', legendX + 25, legendY + 12);
    
    // Interest legend (orange)
    const interestLegendGradient = ctx.createLinearGradient(legendX + 70, legendY, legendX + 90, legendY + 15);
    interestLegendGradient.addColorStop(0, '#FFAB40');
    interestLegendGradient.addColorStop(0.5, '#FF9800');
    interestLegendGradient.addColorStop(1, '#F57C00');
    ctx.fillStyle = interestLegendGradient;
    ctx.fillRect(legendX + 70, legendY, 20, 15);
    ctx.strokeStyle = '#E65100';
    ctx.lineWidth = 1;
    ctx.strokeRect(legendX + 70, legendY, 20, 15);
    ctx.fillStyle = '#212121';
    ctx.fillText('이자', legendX + 95, legendY + 12);
    
    // Add hover effect
    let tooltipDiv = document.getElementById('chart-tooltip');
    if (!tooltipDiv) {
        tooltipDiv = document.createElement('div');
        tooltipDiv.id = 'chart-tooltip';
        tooltipDiv.style.position = 'absolute';
        tooltipDiv.style.display = 'none';
        tooltipDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        tooltipDiv.style.color = '#fff';
        tooltipDiv.style.padding = '10px';
        tooltipDiv.style.borderRadius = '6px';
        tooltipDiv.style.fontSize = '12px';
        tooltipDiv.style.pointerEvents = 'none';
        tooltipDiv.style.zIndex = '1000';
        tooltipDiv.style.whiteSpace = 'nowrap';
        document.body.appendChild(tooltipDiv);
    }
    
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        let found = false;
        
        for (const bar of barData) {
            if (mouseX >= bar.x && mouseX <= bar.x + bar.width &&
                mouseY >= bar.y && mouseY <= bar.y + bar.height) {
                
                tooltipDiv.innerHTML = `
                    <strong>${bar.data.month}개월차</strong><br>
                    원금: ${formatCurrency(bar.data.principal)}<br>
                    이자: ${formatCurrency(bar.data.interest)}<br>
                    상환액: ${formatCurrency(bar.data.payment)}<br>
                    잔액: ${formatCurrency(bar.data.balance)}
                `;
                tooltipDiv.style.display = 'block';
                tooltipDiv.style.left = (e.clientX + 10) + 'px';
                tooltipDiv.style.top = (e.clientY + 10) + 'px';
                
                canvas.style.cursor = 'pointer';
                found = true;
                break;
            }
        }
        
        if (!found) {
            tooltipDiv.style.display = 'none';
            canvas.style.cursor = 'default';
        }
    });
    
    canvas.addEventListener('mouseleave', () => {
        tooltipDiv.style.display = 'none';
        canvas.style.cursor = 'default';
    });
}

/**
 * Sample schedule for display (reduce number of bars)
 */
function sampleSchedule(schedule, maxCount) {
    if (schedule.length <= maxCount) return schedule;
    
    const result = [];
    const step = Math.ceil(schedule.length / maxCount);
    
    for (let i = 0; i < schedule.length; i += step) {
        result.push(schedule[i]);
    }
    
    // Always include last item
    if (result[result.length - 1].month !== schedule[schedule.length - 1].month) {
        result.push(schedule[schedule.length - 1]);
    }
    
    return result;
}

/**
 * Format value for chart labels
 */
function formatChartValue(value) {
    if (value >= 100000000) {
        return (value / 100000000).toFixed(1) + '억';
    } else if (value >= 10000000) {
        return Math.round(value / 10000000) + '천만';
    } else if (value >= 10000) {
        return Math.round(value / 10000) + '만';
    } else {
        return value.toString();
    }
}

// Redraw charts on window resize
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        // Redraw visible charts
        const loanChartSection = document.getElementById('loan-chart-section');
        const housingLoanChartSection = document.getElementById('housing-loan-chart-section');
        
        if (loanChartSection && loanChartSection.style.display !== 'none') {
            // Would need to store schedule data to redraw
            console.log('Resize: loan chart');
        }
        
        if (housingLoanChartSection && housingLoanChartSection.style.display !== 'none') {
            console.log('Resize: housing loan chart');
        }
    }, 250);
});

