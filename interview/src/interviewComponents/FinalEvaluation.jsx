import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/FinalEvaluation.css';

const FinalEvaluation = ({ evaluation, answers }) => {
  const navigate = useNavigate();

  const getScoreColor = (score) => {
    if (score >= 8) return 'excellent';
    if (score >= 6) return 'good';
    return 'needs-improvement';
  };

  return (
    <div className="final-evaluation">
      <h2>Interview Evaluation</h2>
      
      <div className="overall-score-section">
        <h3>Overall Performance</h3>
        <div className={`score-circle ${getScoreColor(evaluation.overallScore)}`}>
          {evaluation.overallScore}/10
        </div>
      </div>

      <div className="skill-assessment">
        <h3>Skill Assessment</h3>
        <div className="skill-scores">
          {Object.entries(evaluation.skillAssessment).map(([skill, score]) => (
            <div key={skill} className="skill-score">
              <label>{skill.replace(/([A-Z])/g, ' $1').trim()}</label>
              <div className={`score-bar ${getScoreColor(score)}`}>
                <div className="fill" style={{ width: `${score * 10}%` }}></div>
                <span>{score}/10</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="question-analysis">
        <h3>Question-by-Question Analysis</h3>
        {answers.map((answer, index) => (
          <div key={index} className="question-review">
            <h4>Question {index + 1}</h4>
            <div className="question-content">
              <p><strong>Topic:</strong> {answer.question.topic}</p>
              <p><strong>Question:</strong> {answer.question.question}</p>
              <p><strong>Your Answer:</strong> {answer.answer}</p>
              {answer.code && (
                <div className="code-section">
                  <p><strong>Code Provided:</strong></p>
                  <pre>{answer.code}</pre>
                </div>
              )}
              <div className="question-scores">
                <div className={`score-item ${getScoreColor(answer.evaluation.technicalAccuracy)}`}>
                  <span>Technical Accuracy:</span>
                  <span>{answer.evaluation.technicalAccuracy}/10</span>
                </div>
                <div className={`score-item ${getScoreColor(answer.evaluation.communication)}`}>
                  <span>Communication:</span>
                  <span>{answer.evaluation.communication}/10</span>
                </div>
              </div>
              <div className="question-feedback">
                <p><strong>Feedback:</strong> {answer.evaluation.feedback}</p>
                {answer.evaluation.improvements && (
                  <div className="improvements">
                    <p><strong>Areas for Improvement:</strong></p>
                    <ul>
                      {answer.evaluation.improvements.map((improvement, i) => (
                        <li key={i}>{improvement}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="final-feedback">
        <h3>Overall Feedback</h3>
        <div className="strengths">
          <h4>Key Strengths</h4>
          <ul>
            {evaluation.strengths.map((strength, index) => (
              <li key={index}>{strength}</li>
            ))}
          </ul>
        </div>
        <div className="improvements">
          <h4>Areas for Improvement</h4>
          <ul>
            {evaluation.areasForImprovement.map((area, index) => (
              <li key={index}>{area}</li>
            ))}
          </ul>
        </div>
        <div className="career-readiness">
          <h4>Career Readiness Assessment</h4>
          <p><strong>Level:</strong> {evaluation.careerReadiness.level}</p>
          <p><strong>Recommendation:</strong> {evaluation.careerReadiness.recommendation}</p>
        </div>
      </div>

      <div className="action-buttons">
        <button onClick={() => navigate('/dashboard')} className="primary-button">
          Return to Dashboard
        </button>
        <button onClick={() => window.print()} className="secondary-button">
          Download Report
        </button>
      </div>
    </div>
  );
};

export default FinalEvaluation; 