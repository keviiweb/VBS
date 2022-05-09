import styles from './styles.module.css'

/**
 * Component
 */
export default function Text({ variant, children, color, align, spacing }) {
  const Component = variant
  const variantStyle = styles[variant]
  const colorStyle = styles[color ?? 'white']
  const alignStyle = styles[align ?? 'textLeft']
  const spacingStyle = styles[spacing ?? '']

  return (
    <Component className={`${variantStyle} ${colorStyle} ${alignStyle} ${spacingStyle}`}>
      {children}
    </Component>
  )
}