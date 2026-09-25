"use client";

import { useState, type ComponentProps } from "react";
import { Eye, EyeOff } from "lucide-react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";

type Props = Omit<ComponentProps<typeof InputGroupInput>, "type">;

export function PasswordInput(props: Props) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <InputGroup>
      <InputGroupInput {...props} type={showPassword ? "text" : "password"} />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOff /> : <Eye />}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}
