export type ULoaderVariants = 'black' | 'green' | 'white';
export type ULoaderSizes = 'sm' | 'md' | 'lg';

export type ULoaderProps = {
  size?: ULoaderSizes;
  variant?: ULoaderVariants;
  class?: string;
};
