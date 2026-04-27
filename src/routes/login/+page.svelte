<script lang="ts">
    import { enhance } from '$app/forms';
    let { form } = $props();
</script>

<svelte:head>
    <title>Brigade Login</title>
</svelte:head>

<div class="min-vh-100 d-flex align-items-center justify-content-center bg-light">
    <div class="container text-center max-w-sm" style="max-width: 400px;">
        <i class="bi bi-shield-lock-fill display-1 text-primary mb-4 d-inline-block"></i>
        <h2 class="fw-bold mb-4">Brigade Access</h2>
        
        <div class="card shadow-sm border-0">
            <div class="card-body p-4">
                <form method="POST" use:enhance>
                    <div class="mb-3">
                        <label for="pin" class="form-label text-muted">Enter Brigade PIN</label>
                        <input 
                            type="password" 
                            inputmode="numeric" 
                            pattern="[0-9]*" 
                            class="form-control form-control-lg text-center fs-3 letter-spacing-lg" 
                            id="pin" 
                            name="pin" 
                            required
                        >
                    </div>
                    
                    {#if form?.incorrect}
                        <div class="alert alert-danger py-2 mb-3" role="alert">
                            Incorrect PIN. Please try again.
                        </div>
                    {/if}

                    <button type="submit" class="btn btn-primary btn-lg w-100 shadow-sm">
                        Unlock
                    </button>
                </form>
            </div>
        </div>
    </div>
</div>