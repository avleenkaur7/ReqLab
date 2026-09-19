
import { useState, useEffect, useRef } from "react";
import "./TestPanel.css";

const API_URL = "https://reqlab-backend.onrender.com";

function TestPanel({ responseData, url, method }) {
  const testBuilderRef = useRef(null);

  const [testType, setTestType] = useState("");
  const [expectedStatus, setExpectedStatus] = useState("");
  const [fieldName, setFieldName] = useState("");
  const [expectedValue, setExpectedValue] = useState("");
  const [tests, setTests] = useState([]);
  const [editingTest, setEditingTest] = useState(null);
  const [showSavedTests, setShowSavedTests] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  const authHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`
  });

  // Fetch saved tests
  useEffect(() => {
    const fetchTests = async () => {
      try {
        const response = await fetch(`${API_URL}/api/tests`, {
          headers: authHeaders()
        });

        const data = await response.json();

        if (response.ok && Array.isArray(data)) {
          setTests(data);
        } else {
          setTests([]);
          console.error("Could not fetch tests:", data);
        }
      } catch (err) {
        console.error("Error fetching saved tests:", err);
        setTests([]);
      }
    };

    fetchTests();
  }, []);

  // Edit a test
  const editTest = (test) => {
    setEditingTest(test);
    setTestType(test.type);

    if (test.type === "status") {
      setExpectedStatus(test.expected);
    }

    if (test.type === "field") {
      setFieldName(test.field);
      setExpectedValue(test.expected);
    }

    testBuilderRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  };

  // Add a test
  const addTest = async () => {
    if (!url) {
      alert("Please enter a URL first.");
      return;
    }

    if (!responseData) {
      alert("Please send the request first.");
      return;
    }

    if (!testType) {
      alert("Please select a test type.");
      return;
    }

    let newTest;

    if (testType === "status") {
      if (!expectedStatus) {
        alert("Please enter an expected status code.");
        return;
      }

      newTest = {
        type: "status",
        field: null,
        expected: expectedStatus,
        result: "NOT RUN",
        method,
        url
      };
    } else if (testType === "field") {
      if (!fieldName || !expectedValue) {
        alert("Please enter the field name and expected value.");
        return;
      }

      newTest = {
        type: "field",
        field: fieldName,
        expected: expectedValue,
        result: "NOT RUN",
        method,
        url
      };
    }

    try {
      const response = await fetch(`${API_URL}/api/tests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders()
        },
        body: JSON.stringify(newTest)
      });

      const savedTest = await response.json();

      if (!response.ok) {
        throw new Error(savedTest.message || "Failed to save test");
      }

      setTests((previousTests) => [...previousTests, savedTest]);
      setSuccessMessage("Test added successfully.");
      setError("");
    } catch (err) {
      console.error("Error adding test:", err);
      setError("Could not save the test.");
    }
  };

  // Run all saved tests
  const runAllTests = async () => {
    if (tests.length === 0) {
      return;
    }

    let currentResponse = responseData;

    try {
      if (!currentResponse) {
        const firstTest = tests[0];

        const response = await fetch(`${API_URL}/api/test`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders()
          },
          body: JSON.stringify({
            method: firstTest.method,
            url: firstTest.url,
            headers: {},
            body: ""
          })
        });

        currentResponse = await response.json();
      }

      const results = tests.map((test) => {
        let passed = false;

        if (test.type === "status") {
          passed =
            Number(currentResponse.status) === Number(test.expected);
        }

        if (test.type === "field") {
          const actualValue = currentResponse.data?.[test.field];

          passed =
            String(actualValue) === String(test.expected);
        }

        return {
          ...test,
          result: passed ? "PASS" : "FAIL"
        };
      });

      setTests(results);

      for (const test of results) {
        await fetch(`${API_URL}/api/tests/${test.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders()
          },
          body: JSON.stringify({
            type: test.type,
            field: test.field,
            expected: test.expected,
            result: test.result,
            method: test.method,
            url: test.url
          })
        });
      }
    } catch (err) {
      console.error("Error running tests:", err);
      setError("Could not run the tests.");
    }
  };

  // Run one saved test
  const runSavedTest = async (test) => {
    try {
      const response = await fetch(`${API_URL}/api/test`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders()
        },
        body: JSON.stringify({
          method: test.method,
          url: test.url,
          headers: {},
          body: ""
        })
      });

      const freshResponse = await response.json();

      let passed = false;

      if (test.type === "status") {
        passed =
          Number(freshResponse.status) === Number(test.expected);
      }

      if (test.type === "field") {
        const actualValue = freshResponse.data?.[test.field];

        passed =
          String(actualValue) === String(test.expected);
      }

      const updatedTest = {
        ...test,
        result: passed ? "PASS" : "FAIL"
      };

      await fetch(`${API_URL}/api/tests/${test.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders()
        },
        body: JSON.stringify({
          type: updatedTest.type,
          field: updatedTest.field,
          expected: updatedTest.expected,
          result: updatedTest.result,
          method: updatedTest.method,
          url: updatedTest.url
        })
      });

      setTests((previousTests) =>
        previousTests.map((item) =>
          item.id === test.id ? updatedTest : item
        )
      );
    } catch (err) {
      console.error("Saved test failed:", err);
      setError("Could not run the saved test.");
    }
  };

  // Delete a test
  const deleteTest = async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/tests/${id}`, {
        method: "DELETE",
        headers: authHeaders()
      });

      if (!response.ok) {
        throw new Error("Failed to delete test");
      }

      setTests((previousTests) =>
        previousTests.filter((test) => test.id !== id)
      );
    } catch (err) {
      console.error("Delete error:", err);
      setError("Could not delete the test.");
    }
  };

  // Update a test
  const updateTest = async () => {
    if (!editingTest) return;

    const updatedTest = {
      type: testType,
      field: testType === "field" ? fieldName : null,
      expected: testType === "status" ? expectedStatus : expectedValue,
      result: "NOT RUN",
      method,
      url
    };

    try {
      const response = await fetch(
        `${API_URL}/api/tests/${editingTest.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders()
          },
          body: JSON.stringify(updatedTest)
        }
      );

      const savedTest = await response.json();

      if (!response.ok) {
        throw new Error(savedTest.message || "Update failed");
      }

      setTests((previousTests) =>
        previousTests.map((test) =>
          test.id === editingTest.id ? savedTest : test
        )
      );

      setEditingTest(null);
      setSuccessMessage("Test updated successfully.");
    } catch (err) {
      console.error("Update error:", err);
      setError("Could not update the test.");
    }
  };

  return (
    <div className="test-panel">
      <h3>Tests</h3>

      <div className="test-builder" ref={testBuilderRef}>
        <h4>Create Test</h4>

        <label>Test Type</label>

        <select
          value={testType}
          onChange={(e) => setTestType(e.target.value)}
        >
          <option value="">Select a test type</option>
          <option value="status">Status Code</option>
          <option value="field">Response Field</option>
        </select>

        {testType === "status" && (
          <div>
            <label>Expected Status Code</label>

            <input
              type="number"
              placeholder="e.g. 200"
              value={expectedStatus}
              onChange={(e) => setExpectedStatus(e.target.value)}
            />
          </div>
        )}

        {testType === "field" && (
          <div>
            <label>Field Name</label>

            <input
              type="text"
              placeholder="e.g. id"
              value={fieldName}
              onChange={(e) => setFieldName(e.target.value)}
            />

            <label>Expected Value</label>

            <input
              type="text"
              placeholder="e.g. 1"
              value={expectedValue}
              onChange={(e) => setExpectedValue(e.target.value)}
            />
          </div>
        )}

        <button onClick={editingTest ? updateTest : addTest}>
          {editingTest ? "Update Test" : "+ Add Test"}
        </button>

        {successMessage && (
          <p className="success-message">{successMessage}</p>
        )}

        {error && <p className="error-message">{error}</p>}
      </div>

      <button className="run-all-button" onClick={runAllTests}>
        Run All Tests
      </button>

      <button
        className="saved-tests-toggle"
        onClick={() => setShowSavedTests(!showSavedTests)}
      >
        {showSavedTests ? "Hide Saved Tests" : "Show Saved Tests"}
      </button>

      {showSavedTests && (
        <div className="saved-tests">
          <h4>Saved Tests</h4>

          {tests.length === 0 ? (
            <p>No tests added yet.</p>
          ) : (
            tests.map((test, index) => (
              <div
                className={`test-item ${
                  test.result === "PASS"
                    ? "pass"
                    : test.result === "FAIL"
                    ? "fail"
                    : "not-run"
                }`}
                key={test.id || index}
              >
                <h4>Test {index + 1}</h4>

                {test.type === "status" ? (
                  <p>Status Code: {test.expected}</p>
                ) : (
                  <>
                    <p>Field: {test.field}</p>
                    <p>Expected: {test.expected}</p>
                  </>
                )}

                <p>Result: {test.result}</p>

                <button onClick={() => runSavedTest(test)}>Run</button>
                <button onClick={() => editTest(test)}>Edit</button>
                <button onClick={() => deleteTest(test.id)}>
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default TestPanel;