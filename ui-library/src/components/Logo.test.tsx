import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Logo } from "./Logo";

describe("Logo", () => {
  test("renders the default title and no subtext when no props are passed", () => {
    render(<Logo />);
    expect(screen.getByText("Article Collections")).toBeInTheDocument();
    expect(screen.queryByText(/^by /)).toBeNull();
  });

  test("renders the title and subtext passed via props", () => {
    render(<Logo title="My Journal" subtext="by Ada Lovelace" />);
    expect(screen.getByText("My Journal")).toBeInTheDocument();
    expect(screen.getByText("by Ada Lovelace")).toBeInTheDocument();
    expect(screen.queryByText("Article Collections")).toBeNull();
  });

  test("does not render the subtext div when subtext is not passed", () => {
    render(<Logo title="My Journal" />);
    expect(screen.queryByTestId("logo-subtext")).toBeNull();
  });

  test("renders the title as text when no image is passed", () => {
    render(<Logo title="My Journal" />);
    expect(screen.getByText("My Journal")).toBeInTheDocument();
    expect(screen.queryByRole("img")).toBeNull();
  });

  test("renders an image with the title as alt text when image is passed", () => {
    render(<Logo title="My Journal" image="https://example.com/logo.png" />);

    const image = screen.getByRole("img", { name: "My Journal" });
    expect(image).toHaveAttribute("src", "https://example.com/logo.png");
    expect(screen.queryByText("My Journal")).toBeNull();
  });

  test("has no button role and is not clickable when onClick is not passed", () => {
    render(<Logo />);
    expect(screen.queryByRole("button")).toBeNull();
  });

  test("calls onClick when clicked", async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(<Logo onClick={onClick} />);

    await user.click(screen.getByRole("button"));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
