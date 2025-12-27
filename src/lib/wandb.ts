import { wandb } from '@wandb/sdk';

export const initWandb = async (projectName: string = 'healthwise') => {
  try {
    await wandb.init({ project: projectName });
    return wandb;
  } catch (error) {
    console.warn('WandB init failed (logging disabled):', error);
    return null;
  }
};

export const logMetrics = (metrics: Record<string, any>) => {
  try {
    wandb.log(metrics);
  } catch (error) {
    // Ignore logging errors
  }
};

export const finishRun = async () => {
  try {
    await wandb.finish();
  } catch (error) {
    // Ignore finish errors
  }
};

export { wandb };
