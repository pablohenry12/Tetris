const canvas = document.getElementById("gameCanvas");
        const ctx = canvas.getContext("2d");

        function drawGrid() {
            const cols = 10;
            const rows = 20;
            const cellSize = canvas.width / cols;

            ctx.strokeStyle = "#444";
            for (let i = 0; i <= rows; i++) {
                ctx.beginPath();
                ctx.moveTo(0, i * cellSize);
                ctx.lineTo(canvas.width, i * cellSize);
                ctx.stroke();
            }
            for (let j = 0; j <= cols; j++) {
                ctx.beginPath();
                ctx.moveTo(j * cellSize, 0);
                ctx.lineTo(j * cellSize, canvas.height);
                ctx.stroke();
            }
        }

        drawGrid();