export const TagMode = {
  Light: 'light',
  Dark: 'dark',
  Blue: 'blue',
} as const;

export type TagMode = (typeof TagMode)[keyof typeof TagMode];

export interface TagProps {
  readonly label: string;
  readonly readOnly?: boolean;
  readonly mode?: TagMode;
  readonly className?: string;
}
