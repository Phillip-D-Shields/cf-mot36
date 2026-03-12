<script lang="ts">
    import QuizForm from '$lib/components/QuizForm.svelte';
    
    let { data } = $props();
</script>

<QuizForm 
    initialQuiz={data.quiz} 
    initialQuestions={data.questions} 
    isEdit={true} 
/>