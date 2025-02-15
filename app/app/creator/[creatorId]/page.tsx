import StreamView from "@/app/components/StreamView"

export default function CreatorPage({
    params: {
        creatorId
    }
}:{
    params:{
        creatorId:string
    }
}) {
    return <div> 
        alert(creatorId)
        
        <StreamView creatorId={creatorId}/></div>
}
