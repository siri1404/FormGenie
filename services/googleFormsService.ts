import { FormData, Question, QuestionType } from '../types';

// Maps our internal question type to the Google Forms API's choice type enum.
const getChoiceType = (type: QuestionType) => {
  switch (type) {
    case QuestionType.MULTIPLE_CHOICE:
      return 'RADIO';
    case QuestionType.CHECKBOX:
      return 'CHECKBOX';
    default:
      // This function should only be called for choice questions.
      return 'CHOICE_TYPE_UNSPECIFIED';
  }
};

// Constructs a single request object for the batchUpdate endpoint.
const createQuestionRequest = (question: Question, index: number) => {
  const { type, text, options, is_required } = question;
  let questionItem: any = {};

  if (type === QuestionType.MULTIPLE_CHOICE || type === QuestionType.CHECKBOX) {
    questionItem.question = {
      required: is_required || false,
      choiceQuestion: {
        type: getChoiceType(type),
        options: options?.map(option => ({ value: option })) || [],
      },
    };
  } else if (type === QuestionType.SHORT_ANSWER || type === QuestionType.LONG_ANSWER) {
    questionItem.question = {
      required: is_required || false,
      textQuestion: {
        paragraph: type === QuestionType.LONG_ANSWER,
      },
    };
  } else {
    // Skip unsupported question types
    return null;
  }

  return {
    createItem: {
      item: {
        title: text,
        questionItem,
      },
      location: {
        index,
      },
    },
  };
};

export const createGoogleForm = async (formData: FormData, token: string): Promise<string> => {
  try {
    // 1. Create a new, blank form to get a formId
    const createFormResponse = await fetch('https://forms.googleapis.com/v1/forms', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        info: {
          title: formData.title,
          documentTitle: formData.title,
        },
      }),
    });

    if (!createFormResponse.ok) {
      const error = await createFormResponse.json();
      console.error('Google Forms API Error:', error);
      throw new Error(`Google API Error (Create): ${error.error?.message || 'Failed to create form'}`);
    }

    const newForm = await createFormResponse.json();
    const formId = newForm.formId;

    // 2. Prepare a batch update to add all questions and the description
    // Fix: Explicitly type `requests` as `any[]` to allow different object shapes.
    const requests: any[] = formData.questions
      .map((q, i) => createQuestionRequest(q, i))
      .filter(Boolean); // Filter out any null requests for unsupported types

    // Add the form description as the first update request
    if (formData.description) {
      requests.unshift({
        updateFormInfo: {
          info: {
            description: formData.description,
          },
          updateMask: 'description',
        },
      });
    }

    if (requests.length === 0) {
      // If there are no questions, we can just return the form link
      return newForm.responderUri;
    }

    // 3. Send the batch update request
    const batchUpdateResponse = await fetch(`https://forms.googleapis.com/v1/forms/${formId}:batchUpdate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests,
      }),
    });

    if (!batchUpdateResponse.ok) {
      const error = await batchUpdateResponse.json();
      console.error('Google Forms Batch Update Error:', error);
      throw new Error(`Google API Error (Update): ${error.error?.message || 'Failed to update form'}`);
    }

    return newForm.responderUri;

  } catch (error) {
    console.error("Failed to create Google Form:", error);
    if (error instanceof Error) {
        throw error;
    }
    throw new Error("An unknown error occurred while creating the Google Form.");
  }
};
