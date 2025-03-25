import { useState, useEffect } from 'react'
import { fetchUserData } from '@/store/linkStore'
import QuickActions from '@/components/tsx/main/QuickActions'
import LinksSection from '@/components/tsx/main/LinksSection'
import CollectionsSection from '@/components/tsx/main/CollectionsSection'
import AddLinkDialog from './AddLinkDialog'
import AddCollectionDialog from './AddCollectionDialog'

const Dashboard = () => {
  const [addLinkOpen, setAddLinkOpen] = useState(false)
  const [addCollectionOpen, setAddCollectionOpen] = useState(false)

  useEffect(() => {
    //fetchUserData()
  }, [])

  return (
    <div className="container mx-auto px-4 pt-24 pb-12">
      {/* Quick Actions */}
      <QuickActions
        onAddLink={() => setAddLinkOpen(true)}
        onAddCollection={() => setAddCollectionOpen(true)}
      />

      {/* Dialogs */}
      <AddLinkDialog
        open={addLinkOpen}
        onOpenChange={setAddLinkOpen}
        onSuccess={() => fetchUserData()}
      />
      <AddCollectionDialog
        open={addCollectionOpen}
        onOpenChange={setAddCollectionOpen}
        onSuccess={() => fetchUserData()}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Recent Links */}
        <LinksSection />

        {/* Collections */}
        <CollectionsSection />
      </div>
    </div>
  )
}

export default Dashboard
