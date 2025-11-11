export default function FieldError({ id, children }) {
  if (!children) return null;
  return (
    <div id={id} role="alert" className="text-sm text-red-600 mt-1">
      {children}
    </div>
  );
}
