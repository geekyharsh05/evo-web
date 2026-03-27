import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2Icon } from "lucide-react";
import ProjectPreview from "../components/ProjectPreview";
import type { Project, Version } from "../types";
import api from "@/configs/axios";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";


const Preview = () => {

  const {data: session, isPending} = authClient.useSession()
  const { projectId, versionId } = useParams()
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchCode = async () => {
   try {
    const { data } = await api.get(`/api/project/preview/${projectId}`)
    setCode(data.project.current_code)
    if(versionId){
      data.project.versions.forEach((version: Version)=>{
        if(version.id === versionId){
          setCode(version.code)
        }
      })
    }
    setLoading(false)
   } catch (error: any) {
    toast.error(error?.response?.data?.message || error.message);
    console.log(error);
   }
  }

  useEffect(()=>{
    if(!isPending){
      if(session?.user){
        fetchCode()
      } else {
        setLoading(false)
      }
    }
  },[isPending, session?.user, projectId, versionId])

  if(loading){
    return (
      <div className='flex items-center justify-center h-screen'>
        <Loader2Icon className='size-7 animate-spin text-sky-400' />
      </div>
    )
  }

  if(!session?.user){
    return (
      <div className='flex flex-col items-center justify-center h-screen text-white'>
        <p className='text-lg'>Please sign in to view this preview</p>
      </div>
    )
  }

  if(!code){
    return (
      <div className='flex flex-col items-center justify-center h-screen text-white'>
        <p className='text-lg'>No preview available</p>
      </div>
    )
  }

  return (
    <div className="h-screen">
      <ProjectPreview project={{current_code: code} as Project} isGenerating={false} showEditorPanel={false}/>
    </div>
  )
}

export default Preview
