// src/routes/interviewRoutes.js

const express = require('express');
const router = express.Router();
const interviewController = require('../controllers/interviewController');
const geminiService = require('../services/geminiService');
const questionService = require('../services/questionService');

// Start new interview
router.post('/start', async (req, res) => {
  try {
    const { interviewCode, skills } = req.body;
    console.log('Starting interview with code:', interviewCode);

    // Initialize interview session
    const interview = await interviewController.startInterview(interviewCode, skills);

    if (!interview) {
      throw new Error('Failed to initialize interview');
    }

    console.log('Interview initialized:', interview);

    res.json({ 
      success: true, 
      interview,
      message: 'Interview started successfully'
    });
  } catch (error) {
    console.error('Error starting interview:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to start interview',
      details: error.message
    });
  }
});

// Get questions based on selected skills
router.get('/:id/questions', (req, res) => {
  try {
    const interviewCode = req.params.id;
    const session = interviewController.getInterviewSession(interviewCode);
    
    if (!session) {
      return res.status(404).json({ error: 'Interview session not found' });
    }

    console.log('Sending questions for session:', session.id);
    res.json(session.questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Error fetching questions' });
  }
});

// Evaluate answer using Gemini
router.post('/evaluate-answer', async (req, res) => {
  try {
    const { answer, question, interviewCode, questionNumber } = req.body;
    
    console.log('Received answer evaluation request:', {
      interviewCode,
      questionNumber,
      hasAnswer: !!answer,
      hasQuestion: !!question,
      answer: answer.substring(0, 50) + '...' // Log first 50 chars of answer
    });

    if (!answer || !question) {
      return res.status(400).json({ 
        success: false,
        error: 'Answer and question are required'
      });
    }

    // Get interview session
    const session = interviewController.getInterviewSession(interviewCode);
    if (!session) {
      console.error('Session not found for code:', interviewCode);
      return res.status(404).json({ 
        success: false,
        error: 'Interview session not found'
      });
    }

    // Evaluate the answer
    console.log('Evaluating answer with Gemini...');
    const evaluation = await geminiService.analyzeAnswer(answer, question);
    console.log('Answer evaluation:', evaluation);

    // Store the answer
    session.answers.push({
      question,
      answer,
      evaluation,
      questionNumber
    });

    // Generate next question if not the last question
    let nextQuestion = null;
    if (questionNumber < session.totalQuestions - 1) {
      console.log('Generating next question...');
      const nextSkill = session.skills[questionNumber + 1];
      const previousQuestions = session.questions.map(q => q.question);
      
      nextQuestion = await geminiService.generateQuestion(
        nextSkill,
        previousQuestions
      );

      // Add metadata to next question
      nextQuestion = {
        ...nextQuestion,
        id: Math.random().toString(36).substr(2, 9),
        skill: nextSkill,
        questionNumber: questionNumber + 2
      };

      // Store the next question
      session.questions.push(nextQuestion);
      console.log('Next question generated:', nextQuestion);
    }

    console.log('Sending response:', {
      success: true,
      hasEvaluation: !!evaluation,
      hasNextQuestion: !!nextQuestion,
      currentQuestion: questionNumber,
      totalQuestions: session.totalQuestions
    });

    res.json({
      success: true,
      evaluation,
      nextQuestion,
      progress: {
        current: questionNumber + 1,
        total: session.totalQuestions
      }
    });

  } catch (error) {
    console.error('Error evaluating answer:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error evaluating answer',
      details: error.message
    });
  }
});

// Generate final evaluation
router.post('/final-evaluation', async (req, res) => {
  try {
    const { answers } = req.body;
    const finalEvaluation = await geminiService.generateFinalEvaluation(answers);
    res.json(finalEvaluation);
  } catch (error) {
    console.error('Error generating final evaluation:', error);
    res.status(500).json({ error: 'Error generating final evaluation' });
  }
});

// Save interview results
router.post('/:id/results', (req, res) => {
  try {
    // Handle saving results
    res.json({ message: 'Results saved successfully' });
  } catch (error) {
    console.error('Error saving results:', error);
    res.status(500).json({ error: 'Error saving results' });
  }
});

// Get interview results
router.get('/:id/results', (req, res) => {
  try {
    // Handle getting results
    res.json({ message: 'Results retrieved successfully' });
  } catch (error) {
    console.error('Error getting results:', error);
    res.status(500).json({ error: 'Error getting results' });
  }
});

module.exports = router;
