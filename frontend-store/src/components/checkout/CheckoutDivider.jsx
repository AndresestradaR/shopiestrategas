export default function CheckoutDivider({ block }) {
  return (
    <hr
      style={{
        borderColor: block.color || '#E5E7EB',
        borderWidth: block.thickness ? `${block.thickness}px` : '1px',
        margin: `${block.margin || 8}px 0`,
      }}
    />
  );
}
