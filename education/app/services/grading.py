def grade_quiz(quiz, responses):
    questions = quiz.get("questions", [])
    correct = 0
    details = []
    for idx, question in enumerate(questions):
        answer = responses.get(str(idx))
        is_correct = False
        if question.get("type") == "mcq":
            is_correct = int(answer or -1) == question.get("answer_index")
        elif question.get("type") == "true_false":
            is_correct = str(answer).lower() == str(question.get("answer")).lower()
        details.append({"prompt": question.get("prompt"), "correct": is_correct, "explanation": question.get("explanation")})
        if is_correct:
            correct += 1
    score = round((correct / max(len(questions), 1)) * 100, 2)
    return {"score": score, "details": details}
