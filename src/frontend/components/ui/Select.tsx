"use client";

type Props = React.SelectHTMLAttributes<HTMLSelectElement>;

export default function Select({ className = "", children, ...props }: Props) {
  return (
    <select className={`select ${className}`} {...props}>
      {children}
    </select>
  );
}
