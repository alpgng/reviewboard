"use client";

type Props = React.InputHTMLAttributes<HTMLInputElement>;

export default function Input({ className = "", ...props }: Props) {
  return <input className={`input ${className}`} {...props} />;
}
