import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeToggle } from "@/components/ThemeToggle";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });

// Mock document.documentElement.setAttribute
const setAttributeMock = vi.fn();
Object.defineProperty(document, "documentElement", {
  value: { setAttribute: setAttributeMock, getAttribute: vi.fn() },
  writable: true,
});

describe("ThemeToggle", () => {
  beforeEach(() => {
    localStorageMock.clear();
    setAttributeMock.mockClear();
  });

  it("renders a button with accessible label", () => {
    render(<ThemeToggle />);
    const button = screen.getByRole("button");
    expect(button).toBeDefined();
    expect(button.getAttribute("aria-label")).toBeTruthy();
  });

  it("toggles theme on click", () => {
    render(<ThemeToggle />);
    const button = screen.getByRole("button");
    fireEvent.click(button);
    // After click, setAttribute should have been called with a theme value
    expect(setAttributeMock).toHaveBeenCalledWith("data-theme", expect.stringMatching(/^(dark|light)$/));
  });

  it("persists theme to localStorage on toggle", () => {
    render(<ThemeToggle />);
    const button = screen.getByRole("button");
    fireEvent.click(button);
    const stored = localStorageMock.getItem("theme");
    expect(stored).toMatch(/^(dark|light)$/);
  });
});
