import { useState, useCallback, useRef, useEffect } from "react";

/**
 * Custom hook for managing form state
 * - Supports resetForm() and resetForm(nextValues)
 * - Exposes setValues for edit prefilling
 */
export const useForm = (initialValues, onSubmit) => {
  const initialRef = useRef(initialValues);

  // If initialValues changes between renders, update ref
  useEffect(() => {
    initialRef.current = initialValues;
  }, [initialValues]);

  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback(
    (e) => {
      const { name, value, type, checked } = e.target;

      setValues((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));

      // clear field error on change
      if (errors[name]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    },
    [errors]
  );

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setIsSubmitting(true);

      try {
        await onSubmit(values);
      } catch (err) {
        if (err.response?.data?.errors) {
          setErrors(err.response.data.errors);
        } else {
          setErrors({ general: err.message || "Something went wrong" });
        }
        throw err; // optional: allows callers to handle too
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, onSubmit]
  );

  // ✅ IMPORTANT: allow resetForm(nextValues)
  const resetForm = useCallback((nextValues) => {
    setValues(nextValues ?? initialRef.current);
    setErrors({});
    setTouched({});
  }, []);

  const setFieldValue = useCallback((name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const setFieldError = useCallback((name, error) => {
    setErrors((prev) => ({ ...prev, [name]: error }));
  }, []);

  return {
    values,
    setValues, // ✅ expose this for edit
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm, // ✅ now accepts optional values
    setFieldValue,
    setFieldError,
  };
};
