# AI Rules for MindEase Support Hub

This document outlines the core technologies used in the MindEase Support Hub application and provides guidelines for using specific libraries.

## Tech Stack Overview

*   **Frontend Framework**: React
*   **Language**: TypeScript
*   **Build Tool**: Vite
*   **UI Component Library**: shadcn/ui (built on Radix UI)
*   **Styling**: Tailwind CSS
*   **Routing**: React Router DOM
*   **State Management (Server Data)**: Tanstack Query
*   **Form Management**: React Hook Form with Zod for validation
*   **Icons**: Lucide React
*   **Date Utilities**: date-fns
*   **Charts**: Recharts
*   **Toasts/Notifications**: shadcn/ui toast system (via `useToast` hook) and Sonner

## Library Usage Rules

To maintain consistency and leverage the existing architecture, please adhere to the following guidelines when developing:

*   **UI Components**: Always prioritize `shadcn/ui` components for building the user interface. If a specific component is not available or requires significant deviation from `shadcn/ui`'s design, create a new, custom component in `src/components/`.
*   **Styling**: Use `Tailwind CSS` exclusively for all styling. Avoid inline styles or creating new `.css` files (except for global styles in `src/index.css`).
*   **Routing**: All client-side navigation and route definitions must use `react-router-dom`. Keep route definitions centralized in `src/App.tsx`.
*   **Server State Management**: For fetching, caching, and updating server-side data, use `Tanstack Query`.
*   **Form Handling**: Implement all forms using `react-hook-form` for state management, validation, and submission. Use `Zod` for defining form schemas and validation rules.
*   **Icons**: Integrate icons using the `lucide-react` library.
*   **Date & Time**: For any date formatting, parsing, or manipulation, use `date-fns`.
*   **Data Visualization**: When creating charts or graphs, use the `recharts` library.
*   **Notifications**: For displaying transient messages to the user (e.g., success, error, info), use the `useToast` hook provided by `shadcn/ui` (from `src/hooks/use-toast.ts`). The `Sonner` component is also available for more advanced toast notifications if needed, but `useToast` should be the default.
*   **Layout**: Utilize the custom `SidebarProvider`, `SidebarTrigger`, and `SidebarInset` components (from `src/components/ui/sidebar`) for consistent application layout.