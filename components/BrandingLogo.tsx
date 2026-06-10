import React, { useRef, useEffect } from "react";

interface BrandingLogoProps {
  className?: string;
  size?: number;
}

const BrandingLogo: React.FC<BrandingLogoProps> = ({ className, size = 450 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const drawLogo = () => {
      ctx.clearRect(0, 0, 900, 900);
      ctx.lineJoin = "round";
      ctx.lineCap = "round";

      // 1. OUTER GLOW EFFECT
      ctx.shadowColor = "rgba(255, 223, 0, 0.4)";
      ctx.shadowBlur = 40;

      // 2. MAIN SHIELD (GOLD EMBLEM BACKGROUND)
      ctx.beginPath();
      ctx.moveTo(450, 160); // Top tip
      ctx.lineTo(680, 260); // Top right shoulder
      ctx.lineTo(680, 560); // Right side wall
      ctx.quadraticCurveTo(680, 720, 450, 800); // Bottom curve left
      ctx.quadraticCurveTo(220, 720, 220, 560); // Left side wall
      ctx.lineTo(220, 260); // Top left shoulder
      ctx.closePath();

      const goldGrad = ctx.createRadialGradient(450, 450, 50, 450, 450, 400);
      goldGrad.addColorStop(0, "#ffe875");
      goldGrad.addColorStop(0.5, "#f5af19");
      goldGrad.addColorStop(1, "#e65c00");
      ctx.fillStyle = goldGrad;
      ctx.fill();

      ctx.lineWidth = 12;
      ctx.strokeStyle = "#ffffff";
      ctx.stroke();

      // Reset shadow for inner elements
      ctx.shadowBlur = 0;

      // 3. INTERNAL BORDER STRIPES (ETHIOPIAN TRICOLOR RIBBON FRAME)
      ctx.lineWidth = 10;
      // Green inner accent
      ctx.strokeStyle = "#009b3a";
      ctx.stroke();

      // 4. CENTRAL LOGO INNER CIRCLE (DARK BLUE BACKGROUND)
      ctx.beginPath();
      ctx.arc(450, 320, 100, 0, Math.PI * 2);
      const blueGrad = ctx.createRadialGradient(450, 320, 20, 450, 320, 100);
      blueGrad.addColorStop(0, "#1d3557");
      blueGrad.addColorStop(1, "#0b132b");
      ctx.fillStyle = blueGrad;
      ctx.fill();
      ctx.lineWidth = 6;
      ctx.strokeStyle = "#ffd700";
      ctx.stroke();

      // 5. VECTOR FLAMINGO
      ctx.fillStyle = "#ffd700";

      // Flamingo Head & Neck
      ctx.beginPath();
      ctx.arc(450, 260, 14, 0, Math.PI * 2); // Head
      ctx.fill();

      ctx.beginPath();
      ctx.lineWidth = 10;
      ctx.strokeStyle = "#ffd700";
      ctx.moveTo(450, 265);
      ctx.quadraticCurveTo(420, 280, 440, 320); // Neck curve
      ctx.stroke();

      // Flamingo Body & Wings
      ctx.beginPath();
      ctx.ellipse(450, 330, 35, 22, Math.PI / 6, 0, Math.PI * 2);
      ctx.fillStyle = "#ffd700";
      ctx.fill();

      // Flamingo Legs & Base Box
      ctx.beginPath();
      ctx.lineWidth = 5;
      ctx.moveTo(445, 350);
      ctx.lineTo(445, 395); // Straight leg
      ctx.moveTo(445, 360);
      ctx.lineTo(460, 375);
      ctx.lineTo(445, 385); // Bent leg
      ctx.stroke();

      // Base Box
      ctx.fillStyle = "#ff8c00"; // Vibrant Orange
      ctx.fillRect(430, 395, 30, 25);
      ctx.fillStyle = "#0b132b";
      ctx.beginPath(); // Three dots on the box
      ctx.arc(445, 403, 3, 0, Math.PI * 2);
      ctx.arc(438, 412, 3, 0, Math.PI * 2);
      ctx.arc(452, 412, 3, 0, Math.PI * 2);
      ctx.fill();

      // 6. MAIN TEXT: "ETHIOLOTTORY"
      ctx.font = '600 76px "Arial Black", Impact, sans-serif';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Text Outline 3D Effect
      ctx.strokeStyle = "#0b132b";
      ctx.lineWidth = 18;
      ctx.strokeText("ETHIOLOTTORY", 450, 490);

      // Text Fill
      const textGrad = ctx.createLinearGradient(450, 450, 450, 530);
      textGrad.addColorStop(0, "#ffffff");
      textGrad.addColorStop(1, "#cfd8dc");
      ctx.fillStyle = textGrad;
      ctx.fillText("ETHIOLOTTORY", 450, 490);

      // 7. BOLD CROWN TEXT: "BINGO"
      ctx.font = 'italic 800 120px "Arial Black", Impact, sans-serif';

      // Outer dark glow/stroke
      ctx.strokeStyle = "#0a361b";
      ctx.lineWidth = 24;
      ctx.strokeText("BINGO", 450, 600);

      // Inner white key outline
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 12;
      ctx.strokeText("BINGO", 450, 600);

      // Vibrant Green Gradient Fill
      const greenGrad = ctx.createLinearGradient(450, 540, 450, 660);
      greenGrad.addColorStop(0, "#a8ff78");
      greenGrad.addColorStop(1, "#78ffd6");
      ctx.fillStyle = greenGrad;
      ctx.fillText("BINGO", 450, 600);

      // 8. BOTTOM RIBBON SCROLL (ETHIOPIAN LOTTERY SERVICE)
      ctx.beginPath();
      ctx.rect(260, 690, 380, 45);
      const redGrad = ctx.createLinearGradient(260, 690, 640, 690);
      redGrad.addColorStop(0, "#d32f2f");
      redGrad.addColorStop(0.5, "#f44336");
      redGrad.addColorStop(1, "#d32f2f");
      ctx.fillStyle = redGrad;
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#ffd700";
      ctx.stroke();

      // Footer Brand Text
      ctx.font = "bold 20px Arial, sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.fillText("ETHIOPIAN LOTTERY SERVICE", 450, 712);

      // 9. DECORATIVE TOP BINGO BALLS
      const balls = [
        { x: 280, y: 240, r: 28, color: "#f44336", num: "12" },
        { x: 330, y: 190, r: 32, color: "#4caf50", num: "24" },
        { x: 390, y: 150, r: 35, color: "#ffeb3b", num: "37", tc: "#000" },
        { x: 510, y: 150, r: 35, color: "#9c27b0", num: "60" },
        { x: 570, y: 190, r: 32, color: "#00bcd4", num: "71" },
      ];

      balls.forEach((b) => {
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fillStyle = b.color;
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#fff";
        ctx.stroke();

        // Ball Value text
        ctx.font = "bold 22px Arial";
        ctx.fillStyle = b.tc || "#fff";
        ctx.fillText(b.num, b.x, b.y + 2);
      });
    };

    drawLogo();
  }, []);

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <canvas
        ref={canvasRef}
        width={900}
        height={900}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          maxWidth: "100%",
          display: "block",
        }}
      />
    </div>
  );
};

export default BrandingLogo;
