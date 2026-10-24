/* eslint-disable next/no-img-element -- Display the supplied brand image in the static site. */
export function BrandMark() {
  return (
    <span className="brand-logo-shell" aria-hidden="true">
      <img
        src="/huiyimeng-brand-user.jpg"
        alt=""
        width="1254"
        height="1254"
        className="brand-logo-image"
      />
    </span>
  );
}
