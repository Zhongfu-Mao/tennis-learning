import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";

describe("V2 app shell", () => {
  it("opens on the Atlas view and navigates between primary sections", async () => {
    const user = userEvent.setup();
    render(<App />);

    const primaryNav = within(screen.getByLabelText("Primary navigation"));
    const atlasButton = primaryNav.getByRole("button", { name: /atlas/i });
    expect(atlasButton).toHaveAttribute("aria-pressed", "true");
    expect(atlasButton).toHaveClass("active");
    expect(screen.getByRole("heading", { name: /knowledge atlas/i })).toBeInTheDocument();

    await user.click(primaryNav.getByRole("button", { name: /path/i }));
    expect(screen.getByRole("heading", { name: /my path/i })).toBeInTheDocument();
    expect(atlasButton).toHaveAttribute("aria-pressed", "false");
    expect(primaryNav.getByRole("button", { name: /path/i })).toHaveAttribute("aria-pressed", "true");

    await user.click(primaryNav.getByRole("button", { name: /drill/i }));
    expect(screen.getByRole("heading", { name: /vr drill library/i })).toBeInTheDocument();

    await user.click(primaryNav.getByRole("button", { name: /review/i }));
    expect(screen.getByRole("heading", { name: /review queue/i })).toBeInTheDocument();

    await user.click(primaryNav.getByRole("button", { name: /settings/i }));
    expect(screen.getByRole("heading", { name: /settings/i })).toBeInTheDocument();
    expect(primaryNav.getByRole("button", { name: /settings/i })).toHaveAttribute("aria-pressed", "true");
  });
});
