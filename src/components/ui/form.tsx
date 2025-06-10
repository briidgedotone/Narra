"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as React from "react";
import {
  useForm,
  UseFormReturn,
  FieldPath,
  FieldValues,
  Controller,
  FormProvider,
} from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

// Form Context
interface FormContextType<T extends FieldValues = FieldValues> {
  form: UseFormReturn<T>;
}

const FormContext = React.createContext<FormContextType | null>(null);

const useFormContext = <T extends FieldValues = FieldValues>() => {
  const context = React.useContext(FormContext) as FormContextType<T> | null;
  if (!context) {
    throw new Error("Form components must be used within a Form");
  }
  return context;
};

// Form Root Component
interface FormProps<T extends FieldValues> {
  children: React.ReactNode;
  form: UseFormReturn<T>;
  onSubmit: (data: T) => void | Promise<void>;
  className?: string;
}

export function Form<T extends FieldValues>({
  children,
  form,
  onSubmit,
  className,
}: FormProps<T>) {
  return (
    <FormProvider {...form}>
      <FormContext.Provider value={{ form } as FormContextType}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className={cn("space-y-6", className)}
        >
          {children}
        </form>
      </FormContext.Provider>
    </FormProvider>
  );
}

// Form Field Component
interface FormFieldProps<T extends FieldValues> {
  name: FieldPath<T>;
  label?: string | undefined;
  description?: string | undefined;
  required?: boolean | undefined;
  children: (field: {
    onChange: (value: any) => void;
    value: any;
    name: string;
    error?: any;
  }) => React.ReactNode;
  className?: string | undefined;
}

export function FormField<T extends FieldValues>({
  name,
  label,
  description,
  required,
  children,
  className,
}: FormFieldProps<T>) {
  const { form } = useFormContext<T>();
  const error = form.formState.errors[name];

  return (
    <Controller
      name={name}
      control={form.control}
      render={({ field }) => (
        <div className={cn("space-y-2", className)}>
          {label && (
            <Label htmlFor={name} className="text-sm font-medium">
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </Label>
          )}
          {children({ ...field, error })}
          {description && !error && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
          {error && (
            <p className="text-sm text-destructive">
              {error.message?.toString()}
            </p>
          )}
        </div>
      )}
    />
  );
}

// Form Input Component
interface FormInputProps<T extends FieldValues> {
  name: FieldPath<T>;
  label?: string | undefined;
  description?: string | undefined;
  required?: boolean | undefined;
  type?: string;
  placeholder?: string;
  className?: string | undefined;
}

export function FormInput<T extends FieldValues>({
  name,
  label,
  description,
  required,
  type = "text",
  placeholder,
  className,
}: FormInputProps<T>) {
  return (
    <FormField
      name={name}
      label={label}
      description={description}
      required={required}
      className={className}
    >
      {field => (
        <Input
          {...field}
          type={type}
          placeholder={placeholder}
          className={cn(
            "transition-colors",
            field.error && "border-destructive focus-visible:ring-destructive"
          )}
        />
      )}
    </FormField>
  );
}

// Form Textarea Component
interface FormTextareaProps<T extends FieldValues> {
  name: FieldPath<T>;
  label?: string | undefined;
  description?: string | undefined;
  required?: boolean | undefined;
  placeholder?: string;
  rows?: number;
  className?: string | undefined;
}

export function FormTextarea<T extends FieldValues>({
  name,
  label,
  description,
  required,
  placeholder,
  rows = 3,
  className,
}: FormTextareaProps<T>) {
  return (
    <FormField
      name={name}
      label={label}
      description={description}
      required={required}
      className={className}
    >
      {field => (
        <textarea
          {...field}
          placeholder={placeholder}
          rows={rows}
          className={cn(
            "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
            field.error && "border-destructive focus-visible:ring-destructive"
          )}
        />
      )}
    </FormField>
  );
}

// Form Select Component
interface FormSelectProps<T extends FieldValues> {
  name: FieldPath<T>;
  label?: string | undefined;
  description?: string | undefined;
  required?: boolean | undefined;
  placeholder?: string;
  options: Array<{ value: string; label: string }>;
  className?: string | undefined;
}

export function FormSelect<T extends FieldValues>({
  name,
  label,
  description,
  required,
  placeholder = "Select an option...",
  options,
  className,
}: FormSelectProps<T>) {
  return (
    <FormField
      name={name}
      label={label}
      description={description}
      required={required}
      className={className}
    >
      {field => (
        <Select onValueChange={field.onChange} value={field.value || ""}>
          <SelectTrigger
            className={cn(
              "transition-colors",
              field.error && "border-destructive focus-visible:ring-destructive"
            )}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </FormField>
  );
}

// Form Submit Button
interface FormSubmitProps {
  children: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  type?: "submit" | "button";
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
}

export function FormSubmit({
  children,
  loading,
  disabled,
  className,
  type = "submit",
  variant = "default",
}: FormSubmitProps) {
  const { form } = useFormContext();
  const isSubmitting = form.formState.isSubmitting || loading;

  return (
    <Button
      type={type}
      disabled={disabled || isSubmitting}
      variant={variant}
      className={className}
    >
      {isSubmitting ? (
        <>
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
          Loading...
        </>
      ) : (
        children
      )}
    </Button>
  );
}

// Form Error Summary
export function FormErrorSummary() {
  const { form } = useFormContext();
  const errors = form.formState.errors;

  const errorCount = Object.keys(errors).length;

  if (errorCount === 0) return null;

  return (
    <div className="rounded-md border border-destructive bg-destructive/10 p-4">
      <div className="flex items-center space-x-2">
        <div className="h-4 w-4 rounded-full bg-destructive flex items-center justify-center">
          <span className="text-xs text-destructive-foreground font-bold">
            !
          </span>
        </div>
        <h3 className="text-sm font-medium text-destructive">
          Please fix the following errors:
        </h3>
      </div>
      <ul className="mt-2 space-y-1 text-sm text-destructive">
        {Object.entries(errors).map(([field, error]) => (
          <li key={field} className="flex items-center space-x-2">
            <span>•</span>
            <span>{error?.message?.toString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Hook for creating forms with validation
export function useNarraForm<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
  defaultValues?: Partial<z.infer<z.ZodObject<T>>>
) {
  return useForm<z.infer<z.ZodObject<T>>>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as any,
    mode: "onChange",
  });
}

// Common validation schemas
export const validationSchemas = {
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  required: (message = "This field is required") => z.string().min(1, message),
  url: z.string().url("Please enter a valid URL"),
  handle: z
    .string()
    .min(1, "Handle is required")
    .regex(
      /^@?[a-zA-Z0-9._]+$/,
      "Handle can only contain letters, numbers, dots, and underscores"
    ),
};

// Example schemas for Use Narra
export const contactFormSchema = z.object({
  name: validationSchemas.required("Name is required"),
  email: validationSchemas.email,
  subject: validationSchemas.required("Subject is required"),
  message: validationSchemas.required("Message is required"),
  priority: z.enum(["low", "medium", "high", "urgent"], {
    required_error: "Please select a priority level",
  }),
});

export const profileSearchSchema = z.object({
  handle: validationSchemas.handle,
  platform: z.enum(["tiktok", "instagram"], {
    required_error: "Please select a platform",
  }),
});

export const boardCreateSchema = z.object({
  name: validationSchemas.required("Board name is required"),
  description: z.string().optional(),
  folderId: z.string().optional(),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;
export type ProfileSearchData = z.infer<typeof profileSearchSchema>;
export type BoardCreateData = z.infer<typeof boardCreateSchema>;
