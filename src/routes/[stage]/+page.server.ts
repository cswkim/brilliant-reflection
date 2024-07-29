import { error } from '@sveltejs/kit';
import type { ServerLoad } from '@sveltejs/kit';
import { lessonData } from '$lib/config';

export const load: ServerLoad = async ({ params }) => {
  const numStages: number = lessonData.length;
  const stageIndex: number = parseInt(params.stage!);
  
  if (isNaN(stageIndex) || stageIndex < 0 || stageIndex >= numStages) {
    throw error(404, 'Stage not found');
  }

  const atStart: boolean = stageIndex === 0;
  const atEnd: boolean = stageIndex === numStages - 1 || stageIndex === numStages - 2;

  return {
    atStart,
    atEnd,
    lastPage: numStages - 1,
    stageData: lessonData[stageIndex],
    pagePrev: atStart ? 0 : stageIndex - 1,
    pageCurrent: stageIndex,
    pageNext: atEnd ? numStages - 1 : stageIndex + 1,
  };
};