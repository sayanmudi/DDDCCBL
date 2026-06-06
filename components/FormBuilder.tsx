"use client";

import { useState } from "react";

interface FormField {
  label: string;
  type: string;
  required: boolean;
  options?: string[];
}

export default function FormBuilder() {
  const [formName, setFormName] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [fields, setFields] =
    useState<FormField[]>([]);

  const addField = () => {
    setFields([
      ...fields,
      {
        label: "",
        type: "text",
        required: false,
        options: [],
      },
    ]);
  };

  const updateField = (
    index: number,
    key: keyof FormField,
    value: any
  ) => {
    const updated = [...fields];

    updated[index] = {
      ...updated[index],
      [key]: value,
    };

    setFields(updated);
  };

  const removeField = (
    index: number
  ) => {
    setFields(
      fields.filter(
        (_, i) => i !== index
      )
    );
  };

  const submitForm = async () => {
    try {

      const response =
        await fetch(
          "/api/forms/create",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              formName,
              description,
              fields,
            }),
          }
        );

      const result =
        await response.json();

      if (result.success) {

        alert(
          "Form Created Successfully"
        );

        setFormName("");
        setDescription("");
        setFields([]);

      } else {

        alert(
          "Failed to Create Form"
        );
      }

    } catch (error) {

      console.error(error);

      alert("Error");
    }
  };

  return (
    <div className="p-5">

      <h2 className="text-xl font-bold">
        Create Form
      </h2>

      <input
        className="border p-2 w-full mb-3"
        placeholder="Form Name"
        value={formName}
        onChange={(e) =>
          setFormName(
            e.target.value
          )
        }
      />

      <textarea
        className="border p-2 w-full mb-3"
        placeholder="Description"
        value={description}
        onChange={(e) =>
          setDescription(
            e.target.value
          )
        }
      />

      <button
        onClick={addField}
        className="bg-blue-500 text-white px-3 py-2 mb-4"
      >
        Add Field
      </button>

      {fields.map(
        (field, index) => (
          <div
            key={index}
            className="border p-3 mb-3"
          >
            <input
              className="border p-2 w-full mb-2"
              placeholder="Field Label"
              value={field.label}
              onChange={(e) =>
                updateField(
                  index,
                  "label",
                  e.target.value
                )
              }
            />

            <select
              className="border p-2 w-full mb-2"
              value={field.type}
              onChange={(e) =>
                updateField(
                  index,
                  "type",
                  e.target.value
                )
              }
            >
              <option value="text">
                Text
              </option>

              <option value="number">
                Number
              </option>

              <option value="date">
                Date
              </option>

              <option value="textarea">
                Textarea
              </option>

              <option value="dropdown">
                Dropdown
              </option>
            </select>

            <label>
              <input
                type="checkbox"
                checked={
                  field.required
                }
                onChange={(e) =>
                  updateField(
                    index,
                    "required",
                    e.target.checked
                  )
                }
              />
              Required
            </label>

            {field.type ===
              "dropdown" && (
              <textarea
                className="border p-2 w-full mt-2"
                placeholder="Option1,Option2,Option3"
                onChange={(e) =>
                  updateField(
                    index,
                    "options",
                    e.target.value
                      .split(",")
                      .map((x) =>
                        x.trim()
                      )
                  )
                }
              />
            )}

            <button
              onClick={() =>
                removeField(
                  index
                )
              }
              className="bg-red-500 text-white px-2 py-1 mt-2"
            >
              Remove
            </button>
          </div>
        )
      )}

      <button
        onClick={submitForm}
        className="bg-green-600 text-white px-4 py-2"
      >
        Save Form
      </button>

    </div>
  );
}