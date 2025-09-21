export function logout() {
    localStorage.removeItem('token') // или sessionStorage
    window.location.href = '/login'
}
