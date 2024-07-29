<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import type p5 from 'p5';

  export let data: {
    atStart: boolean;
    atEnd: boolean;
    lastPage: number;
    stageData: LessonData;
    pagePrev: number;
    pageCurrent: number;
    pageNext: number;
  };

  let answerCorrect: boolean | null = null;
  let currentStage: number = 0;
  let sketch: p5;
  let sketchHTMLElement: HTMLElement;

  $: onLastPage = data.pageCurrent === data.lastPage;
  $: {
    currentStage = data.pageCurrent;
    sketch?.clear();
    sketch?.redraw();

    if (!onLastPage) {
      answerCorrect = null;
    }
  }

  function p5Instance(p: p5): void {
    let canvas: p5.Renderer;
    let mirrorWidth: number;
    let objectTopX: number;
    let objectTopY: number;
    let observerCenterX: number;
    let observerCenterY: number;

    p.setup = () => {
      canvas = p.createCanvas(1, 1);
      resizeCanvas();
    };

    p.draw = () => {
      switch (currentStage) {
        case 1:
          stage1();
          break;
        case 2:
          stage2();
          break;
        case 3:
          stage3();
          break;
        case 4:
          stage4();
          break;
        default:
          stage0();
      }

      // Reset stroke to default after drawing the mirror
      reset();
    };

    p.windowResized = () => {
      resizeCanvas();
    };

    function stage0(): void {
      drawObserver();
      drawObject();
      drawMirror();
    }

    function stage1(): void {
      drawObserver();
      drawObject();
      drawMirror();

      const mirrorCenterX: number = (p.width * 0.5) - (mirrorWidth / 2);
      const mirrorCenterY: number = p.height * 0.5;

      // incidence ray
      drawRay(objectTopX, objectTopY, mirrorCenterX, mirrorCenterY, [255, 215, 0]);

      // reflection ray
      drawRay(mirrorCenterX, mirrorCenterY, observerCenterX, observerCenterY);
    }

    function stage2(): void {
      drawObserver();
      drawObject();
      drawMirror();

      const mirrorWidthDiff: number = mirrorWidth / 2;
      const mirrorCenterX: number = (p.width * 0.5) - mirrorWidthDiff;
      const mirrorCenterXVirtual: number = (p.width * 0.5) + mirrorWidthDiff;
      const mirrorCenterY: number = p.height * 0.5;

      // incidence ray
      drawRay(objectTopX, objectTopY, mirrorCenterX, mirrorCenterY, [255, 215, 0]);

      // reflection ray
      drawRay(mirrorCenterX, mirrorCenterY, observerCenterX, observerCenterY);

      // virtual object
      reset();
      drawObject(true);

      // virtual ray
      drawDottedRay(objectTopX, objectTopY, mirrorCenterXVirtual, mirrorCenterY);
    }

    function stage3(): void {
      drawObserver();
      drawObject();
      drawMirror();
      drawBlocker();
    }

    function stage4(): void {
      drawObserver();
      drawObject();
      drawMirror();

      const mirrorWidthDiff: number = mirrorWidth / 2;
      const mirrorCenterX: number = (p.width * 0.5) - mirrorWidthDiff;
      const mirrorCenterXVirtual: number = (p.width * 0.5) + mirrorWidthDiff;
      const mirrorCenterY: number = p.height * 0.5;

      // incidence ray
      drawRay(objectTopX, objectTopY, mirrorCenterX, mirrorCenterY, [255, 215, 0]);

      // reflection ray
      drawRay(mirrorCenterX, mirrorCenterY, observerCenterX, observerCenterY);

      // virtual object
      reset();
      drawObject(true);

      // virtual ray
      drawDottedRay(objectTopX, objectTopY, mirrorCenterXVirtual, mirrorCenterY);

      drawBlocker();
    }

    function drawObserver(): void {
      const observerX: number = p.width * 0.25;
      const observerY: number = p.height * 0.25;

      // Eye white
      p.fill(255);
      p.stroke(0);
      p.ellipse(observerX, observerY, p.width * 0.08, p.width * 0.05);
      
      // Iris
      p.fill(160, 82, 45);
      p.ellipse(observerX, observerY, p.width * 0.04, p.width * 0.04);
      
      // Pupil
      p.fill(0);
      p.ellipse(observerX, observerY, p.width * 0.02, p.width * 0.02);

      observerCenterX = observerX;
      observerCenterY = observerY;
    }

    function drawObject(isVirtual: boolean = false): void {
      const triangleX: number = isVirtual ? p.width * 0.75 : p.width * 0.25;
      const triangleY: number = p.height * 0.9;
      const triangleSize: number = p.width * 0.075;
      const color: number[] = isVirtual ? [255, 128, 128] : [255, 0, 0];

      p.stroke(0);
      p.fill(color);
      
      p.triangle(
        triangleX, triangleY - triangleSize,
        triangleX - triangleSize / 2, triangleY,
        triangleX + triangleSize / 2, triangleY
      );

      objectTopX = triangleX;
      objectTopY = triangleY - triangleSize;
    }

    function drawMirror(): void {
      const mirrorX = p.width * 0.5;
      mirrorWidth = p.width * 0.008;

      p.stroke(0, 0, 255);
      p.strokeWeight(mirrorWidth);
      p.line(mirrorX, 0, mirrorX, p.height);
    }

    function drawRay(
      startX: number,
      startY: number,
      endX: number,
      endY: number,
      color: number[] = [255, 140, 0],
    ): void {
      const arrowSize: number = 10;
      const angle: number = Math.atan2(endY - startY, endX - startX);

      // Draw the line
      p.stroke(color);
      p.strokeWeight(3);
      p.line(startX, startY, endX, endY);

      // Draw the arrowhead
      p.push();
      p.translate(endX, endY);
      p.rotate(angle);
      p.fill(color);
      p.noStroke();
      p.triangle(0, 0, -arrowSize, arrowSize / 2, -arrowSize, -arrowSize / 2);
      p.pop();
    }

    function drawDottedRay(
      startX: number,
      startY: number,
      endX: number,
      endY: number,
      strokeColor: number[] = [135, 206, 235],
      dotLength: number = 8,
      gapLength: number = 8
    ) {
      p.stroke(strokeColor);
      p.strokeWeight(3);

      // Calculate the total length of the line
      const totalLength: number = p.dist(startX, startY, endX, endY);
      
      // Calculate the direction vector
      const dirX: number = (endX - startX) / totalLength;
      const dirY: number = (endY - startY) / totalLength;

      let drawingDot: boolean = true;
      let currentX: number = startX;
      let currentY: number = startY;
      let remainingLength: number = totalLength;

      while (remainingLength > 0) {
        const segmentLength = drawingDot ? 
          Math.min(dotLength, remainingLength) : 
          Math.min(gapLength, remainingLength);

        if (drawingDot) {
          const nextX: number = currentX + dirX * segmentLength;
          const nextY: number = currentY + dirY * segmentLength;
          p.line(currentX, currentY, nextX, nextY);
        }

        currentX += dirX * segmentLength;
        currentY += dirY * segmentLength;
        remainingLength -= segmentLength;
        drawingDot = !drawingDot;
      }
    }

    function drawBlocker(): void {
      const blockerX = p.width * 0.375;

      p.stroke(128, 128, 128);
      p.strokeWeight(p.width * 0.008);
      p.line(blockerX, p.height * 0.97, blockerX, (p.height * 0.83) - (p.width * 0.075));
    }

    function reset(): void {
      p.stroke(0);
      p.strokeWeight(1);
    }

    function resizeCanvas(): void {
      if (sketchHTMLElement) {
        p.resizeCanvas(sketchHTMLElement.offsetWidth, sketchHTMLElement.offsetHeight);
      }
    }
  }

  function showAnswerDraw(): void {
    goto(`/${data.lastPage}`);
  }

  function handleCorrectAnswer(): void {
    if (!onLastPage) {
      answerCorrect = true;
      showAnswerDraw();
    }
  }

  function handleWrongAnswer(): void {
    if (!onLastPage) {
      answerCorrect = false;
      showAnswerDraw();
    }
  }

  onMount(async () => {
    const p5Module = await import('p5');
    const p5 = p5Module.default;
    
    sketch = new p5(p5Instance, sketchHTMLElement);
  });
</script>

<section class="h-full flex flex-col">
  <div bind:this={sketchHTMLElement} id="sketch-container" class="flex-1"></div>

  <div class="h-44 pt-5 text-lg">
    {@html data.stageData.description}

    {#if data.atEnd}
      <div class="flex gap-x-10 pt-5">
        <button
          class="basis-1/2 rounded-lg border border-black text-left p-2.5"
          class:text-red-500={answerCorrect === false}
          class:hover:opacity-50={answerCorrect === null}
          class:border-red-500={answerCorrect === false}
          on:click={handleWrongAnswer}
        >
          The observer will not be able to see the virtual image of the object since there is a
          barrier in front of the mirror.
        </button>

        <button
          class="basis-1/2 rounded-lg border border-black text-left p-2.5"
          class:text-green-500={answerCorrect === true}
          class:hover:opacity-50={answerCorrect === null}
          class:border-green-500={answerCorrect === true}
          on:click={handleCorrectAnswer}
        >
          The observer can see the virtual object as long as there are light rays that bypass the barrier.
        </button>
      </div>
    {/if}
  </div>

  <footer class="flex">
    {#if !data.atStart}
      <a href="/{data.pagePrev}" class="button">Back</a>
    {/if}
    {#if !data.atEnd}
      <a href="/{data.pageNext}" class="button ml-auto">Next</a>
    {/if}
  </footer>
</section>