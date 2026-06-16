import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  Badge,
  Button,
  Card,
  Gauge,
  Input,
  Modal,
  ToastProvider,
  useToast,
} from "@/components/ui";

describe("Button", () => {
  it("renders its children", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
  });

  it("is disabled and busy while loading", () => {
    render(<Button loading>Saving</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute("aria-busy", "true");
  });

  it("fires onClick when enabled", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Go</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("does not fire onClick when disabled", () => {
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} disabled>
        Go
      </Button>
    );
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe("Badge", () => {
  it("renders content", () => {
    render(<Badge tone="success">Paired</Badge>);
    expect(screen.getByText("Paired")).toBeInTheDocument();
  });
});

describe("Card", () => {
  it("renders children", () => {
    render(<Card>Body content</Card>);
    expect(screen.getByText("Body content")).toBeInTheDocument();
  });
});

describe("Input", () => {
  it("associates label with the field", () => {
    render(<Input label="Email" />);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  it("renders an error and marks the field invalid", () => {
    render(<Input label="Email" error="Required" />);
    expect(screen.getByText("Required")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toHaveAttribute("aria-invalid", "true");
  });
});

describe("Gauge", () => {
  it("clamps and reports an accessible value", () => {
    render(<Gauge value={150} />);
    const meter = screen.getByRole("meter");
    expect(meter).toHaveAttribute("aria-valuenow", "100");
  });

  it("floors a negative value to zero", () => {
    render(<Gauge value={-20} />);
    expect(screen.getByRole("meter")).toHaveAttribute("aria-valuenow", "0");
  });
});

describe("Modal", () => {
  it("renders nothing when closed", () => {
    render(
      <Modal open={false} onClose={() => {}} title="Hi">
        Inside
      </Modal>
    );
    expect(screen.queryByText("Inside")).not.toBeInTheDocument();
  });

  it("renders content when open", () => {
    render(
      <Modal open onClose={() => {}} title="Confirm">
        Inside
      </Modal>
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Inside")).toBeInTheDocument();
  });

  it("calls onClose on Escape", () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="Confirm">
        Inside
      </Modal>
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("calls onClose from the close button", () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="Confirm">
        Inside
      </Modal>
    );
    fireEvent.click(screen.getByLabelText("Close dialog"));
    expect(onClose).toHaveBeenCalledOnce();
  });
});

function ToastHarness() {
  const { toast } = useToast();
  return (
    <button type="button" onClick={() => toast("Saved!", "success")}>
      fire
    </button>
  );
}

describe("Toast", () => {
  it("shows a toast when triggered via useToast", () => {
    render(
      <ToastProvider>
        <ToastHarness />
      </ToastProvider>
    );
    expect(screen.queryByText("Saved!")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "fire" }));
    expect(screen.getByText("Saved!")).toBeInTheDocument();
  });

  it("dismisses a toast via its dismiss button", () => {
    render(
      <ToastProvider>
        <ToastHarness />
      </ToastProvider>
    );
    fireEvent.click(screen.getByRole("button", { name: "fire" }));
    fireEvent.click(screen.getByLabelText("Dismiss notification"));
    expect(screen.queryByText("Saved!")).not.toBeInTheDocument();
  });

  it("throws when useToast is used outside a provider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<ToastHarness />)).toThrow(/ToastProvider/);
    spy.mockRestore();
  });
});
