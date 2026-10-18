"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/** Type: a wiki page the issue can be linked to. */
type WikiPageOption = { id: string; title: string };

/** Picker + "Link" button that links one more wiki page to the issue. */
export function LinkWikiPageForm({
  pages,
  action,
}: {
  pages: WikiPageOption[];
  action: (formData: FormData) => Promise<void>;
}) {
  return (
    <form action={action} className="space-y-2">
      <Label htmlFor="wikiPageId">Link a page</Label>
      <div className="flex gap-2">
        <Select name="wikiPageId" required>
          <SelectTrigger id="wikiPageId" className="min-w-0 flex-1">
            <SelectValue placeholder="Choose a page" />
          </SelectTrigger>
          <SelectContent>
            {pages.map((page) => (
              <SelectItem key={page.id} value={page.id}>
                {page.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <SubmitButton />
      </div>
    </form>
  );
}

/** Submit button that shows "Linking..." while the form is pending. */
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="outline" disabled={pending}>
      {pending ? "Linking..." : "Link"}
    </Button>
  );
}
