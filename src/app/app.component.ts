import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  @ViewChild('gameCanvas', { static: true }) gameCanvas!: ElementRef<HTMLCanvasElement>;

  private ctx!: CanvasRenderingContext2D;
  private bird = { x: 150, y: 200, size: 40, velocity: 0, gravity: 0.4, imageIndex: 0 };
  private pipes: { x: number; y: number; width: number; height: number; gap: number }[] = [];
  private score = 0;
  isGameRunning = false;
  gameOver = false;
  countdown: number | null = null; // Countdown value

  private birdImages: HTMLImageElement[] = [];
  private pipeImages: { top: HTMLImageElement; bottom: HTMLImageElement } = { top: new Image(), bottom: new Image() };

  ngOnInit() {
    this.ctx = this.gameCanvas.nativeElement.getContext('2d')!;
    this.loadImages();
    this.initGame();
  }

  loadImages() {
    // Load bird images
    const birdPaths = ['assets/m1.jpg'];
    this.birdImages = birdPaths.map((path) => {
      const img = new Image();
      img.src = path;
      return img;
    });

    // Load pipe images
    this.pipeImages.top.src = 'assets/dna1.jpg'; // Add your top pipe image
    this.pipeImages.bottom.src = 'assets/dna2.jpg'; // Add your bottom pipe image
  }

  initGame() {
    this.bird.y = 200;
    this.bird.velocity = 0;
    this.bird.imageIndex = 0;
    this.score = 0;
    this.gameOver = false;

    this.pipes = Array.from({ length: 3 }, (_, i) => ({
      x: 800 + i * 300,
      y: Math.random() * 300 + 100,
      width: 50,
      height: 200,
      gap: 150,
    }));

    document.addEventListener('keydown', (event) => {
      if (event.code === 'Space' && this.isGameRunning) {
        this.bird.velocity = -8; // Bird jumps
        this.bird.imageIndex = (this.bird.imageIndex + 1) % this.birdImages.length; // Cycle through bird images
      }
    });
    this.gameCanvas.nativeElement.addEventListener('click', () => {
      if (this.isGameRunning) {
        this.bird.velocity = -8; // Bird jumps
        this.bird.imageIndex = (this.bird.imageIndex + 1) % this.birdImages.length; // Cycle through bird images
      }
    });
  }

  startGame() {
    this.countdown = 3; // Initialize countdown
    const countdownInterval = setInterval(() => {
      if (this.countdown! > 1) {
        this.countdown!--; // Decrease countdown
      } else {
        clearInterval(countdownInterval);
        this.countdown = null; // Clear countdown
        this.isGameRunning = true;
        this.startGameLoop(); // Start game loop
      }
      this.render(); // Re-render the canvas during countdown
    }, 1000);
  }

  restartGame() {
    this.initGame();
    this.startGame();
  }

  startGameLoop() {
    const update = () => {
      if (!this.isGameRunning) return;

      this.updateGameLogic();
      this.render();

      if (this.gameOver) {
        this.isGameRunning = false;
        return;
      }

      requestAnimationFrame(update);
    };

    update();
  }

  updateGameLogic() {
    // Bird physics
    this.bird.velocity += this.bird.gravity;
    this.bird.y += this.bird.velocity;

    // Move pipes
    this.pipes.forEach((pipe) => {
      pipe.x -= 2;

      // Reset pipe when it goes off-screen
      if (pipe.x + pipe.width < 0) {
        pipe.x = 800;
        pipe.y = Math.random() * 300 + 100;
        this.score++;
      }
    });

    // Collision detection
    this.pipes.forEach((pipe) => {
      if (
        (this.bird.x + this.bird.size > pipe.x &&
          this.bird.x < pipe.x + pipe.width &&
          (this.bird.y < pipe.y || this.bird.y + this.bird.size > pipe.y + pipe.gap)) ||
        this.bird.y + this.bird.size > 600 // Hits ground
      ) {
        this.gameOver = true; // End game
      }
    });
  }

  render() {
    this.ctx.clearRect(0, 0, 800, 600);

    // Draw bird
    const birdImage = this.birdImages[this.bird.imageIndex];
    if (birdImage.complete) {
      this.ctx.drawImage(birdImage, this.bird.x, this.bird.y, this.bird.size, this.bird.size);
    }

    // Draw pipes with images
    this.pipes.forEach((pipe) => {
      // Draw top pipe
      if (this.pipeImages.top.complete) {
        this.ctx.drawImage(this.pipeImages.top, pipe.x, 0, pipe.width, pipe.y);
      }

      // Draw bottom pipe
      if (this.pipeImages.bottom.complete) {
        this.ctx.drawImage(this.pipeImages.bottom, pipe.x, pipe.y + pipe.gap, pipe.width, 600 - pipe.y - pipe.gap);
      }
    });

    // Draw score
    this.ctx.fillStyle = 'black';
    this.ctx.font = '20px Arial';
    this.ctx.fillText(`CRISPR Score: ${this.score}`, 100, 20);

    // Display countdown
    if (this.countdown !== null) {
      this.ctx.fillStyle = 'black';
      this.ctx.font = '50px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(this.countdown === 0 ? 'Go!' : this.countdown.toString(), 400, 300);
    }

    // Display game over
    if (this.gameOver) {
      this.ctx.fillStyle = 'red';
      this.ctx.font = '40px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('Game Over', 400, 300);
    }
  }
}
