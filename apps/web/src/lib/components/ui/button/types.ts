import type { HTMLButtonAttributes } from 'svelte/elements';
import type { Snippet } from 'svelte';

export type ButtonVariant = 'primary' | 'secondary';

export type ButtonProps = HTMLButtonAttributes & {
  children: Snippet;
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  ref?: HTMLButtonElement;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
};
