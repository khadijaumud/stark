from ai_security_advisor.question_generator import generate_question
from ai_security_advisor.recommendation_engine import generate_recommendations

history = []

answers = []

print("\n--- AI SECURITY ASSESSMENT START ---\n")

for i in range(5):

    question_data = generate_question(history)

    question = question_data.get("question")
    options = question_data.get("options")

    print(f"Question {i+1}: {question}")

    if options:
        for idx, option in enumerate(options):
            print(f"{idx+1}. {option}")

    # simulate company choosing option 1
    answer = options[0] if options else "Yes"

    print(f"\nSimulated answer: {answer}\n")

    history.append({
        "question": question,
        "answer": answer
    })

    answers.append({
        "question": question,
        "answer": answer
    })

print("\n--- GENERATING SECURITY RECOMMENDATIONS ---\n")

recommendations = generate_recommendations(answers)

print(recommendations)