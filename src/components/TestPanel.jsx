import { useState, useEffect,useRef } from "react";
import "./TestPanel.css";
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
  // Get saved tests
  useEffect(() => {
    fetch("https://reqlab-backend.onrender.com/api/tests", {
      credentials: "include"
    })
      .then((response) => response.json())
      .then((data) => {
        setTests(data);
      });
  }, []);

  // Edit test
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

  // Add test
  const addTest = async () => {
    if (!url) {
      alert("Please enter a URL first");
      return;
    }

    if (!responseData) {
      alert("Please send the request first");
      return;
    }

    let newTest;

    if (testType === "status") {
      if (!expectedStatus) return;

      newTest = {
        type: "status",
        field: null,
        expected: expectedStatus,
        result: "NOT RUN",
        method: method,
        url: url
      };
    } else if (testType === "field") {
      if (!fieldName || !expectedValue) return;

      newTest = {
        type: "field",
        field: fieldName,
        expected: expectedValue,
        result: "NOT RUN",
        method: method,
        url: url
      };
    }

    const response = await fetch("https://reqlab-backend.onrender.com/api/tests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify(newTest)
    });

    const savedTest = await response.json();

    setTests([...tests, savedTest]);
    setSuccessMessage(
      "Test added successfully. Click Show Saved Tests to see all saved tests."
    );
  };

  // Run all tests using current response
  const runAllTests = async () => {

    if (tests.length === 0) return;

    let currentResponse = responseData;

    if (!currentResponse) {
      const test = tests[0];

      const response = await fetch("https://reqlab-backend.onrender.com/api/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          method: test.method,
          url: test.url,
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
        const actualValue = currentResponse.data[test.field];

        passed =
          String(actualValue) === String(test.expected);
      }

      return {
        ...test,
        result: passed ? "PASS" : "FAIL"
      };
    });

    setTests(results);

    // Save results to PostgreSQL
    for (const test of results) {
      await fetch(`https://reqlab-backend.onrender.com/api/tests/${test.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
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
  };

  // Run one saved test
  const runSavedTest = async (test) => {
    try {
      const response = await fetch("https://reqlab-backend.onrender.com/api/test", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          method: test.method,
          url: test.url
        })
      });

      const freshResponse = await response.json();

      let passed = false;

      if (test.type === "status") {
        passed =
          Number(freshResponse.status) === Number(test.expected);
      }

      if (test.type === "field") {
        const actualValue = freshResponse.data[test.field];

        passed =
          String(actualValue) === String(test.expected);
      }

      const updatedTest = {
        ...test,
        result: passed ? "PASS" : "FAIL"
      };

      await fetch(`https://reqlab-backend.onrender.com/api/tests/${test.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          type: updatedTest.type,
          field: updatedTest.field,
          expected: updatedTest.expected,
          result: updatedTest.result,
          method: updatedTest.method,
          url: updatedTest.url
        })
      });

      setTests(
        tests.map((t) =>
          t.id === test.id ? updatedTest : t
        )
      );

    } catch (error) {
      console.log("Saved test failed:", error);
    }
  };

  // Delete test
  const deleteTest = async (id) => {
    console.log("Deleting test:", id);

    const response = await fetch(
      `https://reqlab-backend.onrender.com/api/tests/${id}`,
      {
        method: "DELETE",
        credentials: "include"
      }
    );

    const data = await response.json();

    console.log("Delete response:", data);

    setTests(
      tests.filter((test) => test.id !== id)
    );
  };

  // Update test
  const updateTest = async () => {
    const updatedTest = {
      type: testType,
      field: testType === "field" ? fieldName : null,
      expected:
        testType === "status"
          ? expectedStatus
          : expectedValue,
      result: "NOT RUN",
      method: method,
      url: url
    };

    const response = await fetch(
      `https://reqlab-backend.onrender.com/api/tests/${editingTest.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(updatedTest)
      }
    );

    const savedTest = await response.json();

    setTests(
      tests.map((test) =>
        test.id === editingTest.id
          ? savedTest
          : test
      )
    );

    setEditingTest(null);
  };

  return (
    <div className="test-panel">

      <h3>Tests</h3>

      <div className="test-builder" ref={testBuilderRef} >

        <h4>Create Test</h4>

        <label>Test Type</label>

        <select
          value={testType}
          onChange={(e) => setTestType(e.target.value)}
        >
          <option value="">
            Select a test type
          </option>

          <option value="status">
            Status Code
          </option>

          <option value="field">
            Response Field
          </option>
        </select>

        {testType === "status" && (
          <div>

            <label>
              Expected Status Code
            </label>

            <input
              type="number"
              placeholder="e.g. 200"
              value={expectedStatus}
              onChange={(e) =>
                setExpectedStatus(e.target.value)
              }
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
              onChange={(e) =>
                setFieldName(e.target.value)
              }
            />

            <label>Expected Value</label>

            <input
              type="text"
              placeholder="e.g. 1"
              value={expectedValue}
              onChange={(e) =>
                setExpectedValue(e.target.value)
              }
            />

          </div>
        )}

        <button
          onClick={
            editingTest
              ? updateTest
              : addTest
          }
        >
          {editingTest
            ? "Update Test"
            : "+ Add Test"}
        </button>
        {successMessage && (
          <p className="success-message">{successMessage}</p>
        )}

      </div>

      <button
        className="run-all-button"
        onClick={runAllTests}
      >
        Run All Tests
      </button>

      <button
        className="saved-tests-toggle"
        onClick={() =>
          setShowSavedTests(!showSavedTests)
        }
      >
        {showSavedTests
          ? "Hide Saved Tests"
          : "Show Saved Tests"}
      </button>

      {showSavedTests && (
        <div className="saved-tests">

          <h4>Saved Tests</h4>

          {tests.length === 0 ? (
            <p>No tests added yet.</p>
          ) : (
            tests.map((test, index) => (

              <div
                className={`test-item ${test.result === "PASS"
                  ? "pass"
                  : test.result === "FAIL"
                    ? "fail"
                    : "not-run"
                  }`}
                key={test.id}
              >

                <h4>
                  Test {index + 1}
                </h4>

                {test.type === "status" ? (
                  <p>
                    Status Code: {test.expected}
                  </p>
                ) : (
                  <>
                    <p>
                      Field: {test.field}
                    </p>

                    <p>
                      Expected: {test.expected}
                    </p>
                  </>
                )}

                <p>
                  Result: {test.result}
                </p>

                <button
                  onClick={() =>
                    runSavedTest(test)
                  }
                >
                  Run
                </button>

                <button
                  onClick={() =>
                    editTest(test)
                  }
                >
                  Edit
                </button>

                <button
                  onClick={() =>
                    deleteTest(test.id)
                  }
                >
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