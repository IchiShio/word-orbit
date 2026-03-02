export const TYPE_COLORS = {
  root:   '#e45858',
  prefix: '#3ac4ba',
  suffix: '#9476f0',
} as const

// Ordered array for index-based access (root=0, prefix=1, suffix=2)
export const ORBIT_COLORS = [
  TYPE_COLORS.root,
  TYPE_COLORS.prefix,
  TYPE_COLORS.suffix,
] as const
