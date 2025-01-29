export const createRoom = async (
    {
        userId, 
        name
    } : {
        userId: string, 
        name: string
    }) => {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/create-room`, {
            method: 'post',
            headers: {
              "Content-Type": "application/json",

            },
            credentials: 'include',
            body: JSON.stringify({
                userId,
                name
            })
        })

        const data = await res.json()

        console.log(data)

        return data

    } catch (err) {
        console.error("Unexpected error:", err);
        return { success: false, error: err };
    }
};
