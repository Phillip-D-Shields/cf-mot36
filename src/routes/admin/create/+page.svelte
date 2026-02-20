<script lang="ts">
    import { enhance } from '$app/forms';

    // We changed the correctAnswer type to `string | string[]` so Svelte allows arrays
    let formState = $state({
        title: '',
        description: '',
        reference_url: '',
        pass_threshold: 80,
        questions: [] as Array<{
            id: string;
            text: string;
            type: string;
            options: Array<{ id: string; text: string }>;
            correctAnswer: string | string[]; 
        }>
    });

    function addQuestion() {
        formState.questions.push({
            id: crypto.randomUUID(), 
            text: '',
            type: 'single_choice', 
            options: [{ id: 'opt1', text: '' }, { id: 'opt2', text: '' }],
            correctAnswer: 'opt1' 
        });
    }

    function removeQuestion(index) {
        formState.questions.splice(index, 1);
    }

    function addOption(questionIndex) {
        const id = 'opt' + Math.random().toString(36).substr(2, 5);
        formState.questions[questionIndex].options.push({ id, text: '' });
    }

    function removeOption(qIndex, oIndex) {
        formState.questions[qIndex].options.splice(oIndex, 1);
    }

    // NEW: Automatically switch correctAnswer between a string and an array 
    // depending on the type of question selected.
    function handleTypeChange(question) {
        if (question.type === 'multi_choice') {
            question.correctAnswer = []; // Checkboxes need an array
        } else if (question.type === 'true_false') {
            question.correctAnswer = 'true';
        } else {
            question.correctAnswer = question.options[0]?.id || '';
        }
    }
</script>

<div class="container py-4">
    <h2 class="mb-4">Create New Certification Quiz</h2>

    <form method="POST" use:enhance>
        <div class="card shadow-sm mb-4">
            <div class="card-header bg-light">
                <h5 class="mb-0">Quiz Details</h5>
            </div>
            <div class="card-body">
                <div class="mb-3">
                    <label for="title" class="form-label">Quiz Title</label>
                    <input type="text" class="form-control" name="title" bind:value={formState.title} required placeholder="e.g. Pump Operations Level 1">
                </div>
                
                <div class="row">
                    <div class="col-md-8 mb-3">
                        <label for="desc" class="form-label">Description</label>
                        <input type="text" class="form-control" name="description" bind:value={formState.description}>
                    </div>
                    <div class="col-md-4 mb-3">
                        <label for="pass" class="form-label">Pass Threshold (%)</label>
                        <input type="number" class="form-control" name="pass_threshold" bind:value={formState.pass_threshold} min="1" max="100">
                    </div>
                </div>

                <div class="mb-3">
                    <label for="ref" class="form-label">Reference Material URL</label>
                    <input type="url" class="form-control" name="reference_url" bind:value={formState.reference_url} placeholder="https://brigade-docs.com/manual.pdf">
                </div>
            </div>
        </div>

        <div class="d-flex justify-content-between align-items-center mb-3">
            <h4>Questions ({formState.questions.length})</h4>
            <button type="button" class="btn btn-secondary btn-sm" onclick={addQuestion}>+ Add Question</button>
        </div>

        {#each formState.questions as question, qIndex (question.id)}
            <div class="card mb-3 border-start border-4 border-primary">
                <div class="card-body">
                    <div class="d-flex justify-content-between mb-2">
                        <h6 class="text-primary">Question #{qIndex + 1}</h6>
                        <button type="button" class="btn-close" aria-label="Remove" onclick={() => removeQuestion(qIndex)}></button>
                    </div>

                    <div class="mb-3">
                        <input type="text" class="form-control" placeholder="Enter question text here..." bind:value={question.text} required>
                    </div>

                    <div class="mb-3">
                        <label class="form-label small text-muted">Type</label>
                        <select class="form-select form-select-sm w-auto" bind:value={question.type} onchange={() => handleTypeChange(question)}>
                            <option value="single_choice">Multiple Choice (Single Answer)</option>
                            <option value="multi_choice">Multiple Choice (Multiple Answers)</option>
                            <option value="true_false">True / False</option>
                        </select>
                    </div>

                    <div class="ms-4 p-3 bg-light rounded">
                        {#if question.type === 'true_false'}
                            <div class="form-check">
                                <input class="form-check-input" type="radio" name={'q'+qIndex} value="true" bind:group={question.correctAnswer}>
                                <label class="form-check-label">True</label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="radio" name={'q'+qIndex} value="false" bind:group={question.correctAnswer}>
                                <label class="form-check-label">False</label>
                            </div>
                        {:else}
                            {#each question.options as option, oIndex}
                                <div class="input-group mb-2">
                                    <div class="input-group-text">
                                        {#if question.type === 'single_choice'}
                                            <input class="form-check-input mt-0" type="radio" name={'correct_'+qIndex} value={option.id} bind:group={question.correctAnswer}>
                                        {:else}
                                            <input class="form-check-input mt-0" type="checkbox" value={option.id} bind:group={question.correctAnswer}> 
                                        {/if}
                                    </div>
                                    <input type="text" class="form-control" placeholder="Option text" bind:value={option.text}>
                                    <button class="btn btn-outline-danger" type="button" onclick={() => removeOption(qIndex, oIndex)}>X</button>
                                </div>
                            {/each}
                            <button type="button" class="btn btn-link btn-sm text-decoration-none" onclick={() => addOption(qIndex)}>+ Add Option</button>
                        {/if}
                    </div>
                </div>
            </div>
        {/each}

        <input type="hidden" name="questions_json" value={JSON.stringify(formState.questions)}>

        <hr class="my-4">
        
        <div class="d-grid gap-2 d-md-flex justify-content-md-end">
            <a href="/admin" class="btn btn-light me-md-2">Cancel</a>
            <button type="submit" class="btn btn-success btn-lg px-5">Save Quiz</button>
        </div>
    </form>
</div>