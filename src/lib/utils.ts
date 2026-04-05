import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(price);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(new Date(date));
}

export function truncate(str: string, length: number): string {
  return str.length > length ? `${str.slice(0, length)}...` : str;
}

export function slugify(str: string): string {
  return str.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function isValidEmail(email: string): boolean {
  if (typeof email !== "string") return false;
  const normalized = email.trim();
  if (!normalized || normalized.includes(" ")) return false;

  const parts = normalized.split("@");
  if (parts.length !== 2) return false;

  const [local, domain] = parts;
  if (!local || !domain) return false;
  if (local.length > 64 || domain.length > 255) return false;
  if (local.startsWith(".") || local.endsWith(".") || local.includes("..")) return false;
  if (domain.startsWith(".") || domain.endsWith(".") || domain.includes("..")) return false;

  const domainLabels = domain.split(".");
  if (domainLabels.length < 2) return false;
  if (domainLabels.some((label) => !label)) return false;

  const allowedLocalChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!#$%&'*+/=?^_`{|}~.-";
  for (const char of local) {
    if (!allowedLocalChars.includes(char)) return false;
  }

  const allowedDomainChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-.";
  for (const char of domain) {
    if (!allowedDomainChars.includes(char)) return false;
  }

  const tld = domainLabels[domainLabels.length - 1];
  if (tld.length < 2) return false;

  return true;
}
