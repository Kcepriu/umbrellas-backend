import { HTMLProps } from "react";

declare namespace JSX {
  interface IntrinsicElements {
    div: HTMLProps<HTMLDivElement> & {
      dangerouslySetInnerHTML?: {
        __html: string;
      };
    };
  }
}
