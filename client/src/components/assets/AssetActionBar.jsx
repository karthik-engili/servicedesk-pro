import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import assetService from '../../services/assetService'
import { Button, Modal } from '../ui'
import AssignAssetModal from './AssignAssetModal'
import { handleApiError } from '../../utils/errorHandler'

export function AssetActionBar({ asset, onAssetUpdated, className = '' }) {
  const { user } = useAuth()
  const { showSuccess, showError } = useToast()

  // Modals state
  const [assignOpen, setAssignOpen] = useState(false)
  const [unassignOpen, setUnassignOpen] = useState(false)
  const [repairOpen, setRepairOpen] = useState(false)
  const [returnRepairOpen, setReturnRepairOpen] = useState(false)
  const [replaceOpen, setReplaceOpen] = useState(false)
  const [retireOpen, setRetireOpen] = useState(false)
  const [lostOpen, setLostOpen] = useState(false)
  const [recoverOpen, setRecoverOpen] = useState(false)

  // Form states
  const [actionNotes, setActionNotes] = useState('')
  const [replacementAssetId, setReplacementAssetId] = useState('')
  const [availableAssets, setAvailableAssets] = useState([])
  const [loadingAction, setLoadingAction] = useState(false)

  if (!asset || !user) return null

  const isManager = ['system_admin', 'it_manager', 'asset_manager'].includes(user.role)
  const isTech = user.role === 'technician'
  const isAssignedToMe =
    asset.assignedTo?._id === user._id || asset.assignedTo === user._id

  // Permissions per action
  const canAssign = isManager && asset.status === 'AVAILABLE'
  const canUnassign = isManager && asset.status === 'ASSIGNED'
  const canRepair =
    (isManager || isTech) &&
    (asset.status === 'AVAILABLE' || asset.status === 'ASSIGNED')
  const canReturn = (isManager || isTech) && asset.status === 'UNDER_REPAIR'
  const canReplace =
    isManager && (asset.status === 'ASSIGNED' || asset.status === 'UNDER_REPAIR')
  const canRetire = isManager && asset.status !== 'RETIRED'
  const canReportLost =
    (isManager || isAssignedToMe) && asset.status === 'ASSIGNED'
  const canRecover = isManager && asset.status === 'LOST'

  // Generic action runner
  const executeAction = async (apiCall, successMsg, closeCallback) => {
    setLoadingAction(true)
    try {
      const updated = await apiCall()
      showSuccess(successMsg)
      onAssetUpdated?.(updated)
      setActionNotes('')
      setReplacementAssetId('')
      closeCallback()
    } catch (err) {
      const parsed = handleApiError(err)
      showError(parsed.message || 'Operation failed.')
    } finally {
      setLoadingAction(false)
    }
  }

  // Fetch available replacement candidates when replace modal opens
  const openReplaceModal = async () => {
    setReplaceOpen(true)
    try {
      const res = await assetService.getAssets({ status: 'AVAILABLE', limit: 50 })
      const list = res.assets || []
      setAvailableAssets(list.filter((a) => a._id !== asset._id))
    } catch (err) {
      console.error('Failed to load replacement candidates', err)
    }
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex flex-wrap items-center gap-2">
        {/* Assign */}
        {canAssign && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setAssignOpen(true)}
            className="flex items-center gap-1.5"
          >
            <span>👤</span> Assign Asset
          </Button>
        )}

        {/* Unassign */}
        {canUnassign && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setUnassignOpen(true)}
            className="flex items-center gap-1.5"
          >
            <span>↩️</span> Unassign
          </Button>
        )}

        {/* Send For Repair */}
        {canRepair && (
          <Button
            variant="warning"
            size="sm"
            onClick={() => setRepairOpen(true)}
            className="flex items-center gap-1.5"
          >
            <span>🔧</span> Send for Repair
          </Button>
        )}

        {/* Return from Repair */}
        {canReturn && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setReturnRepairOpen(true)}
            className="flex items-center gap-1.5"
          >
            <span>✅</span> Return to Stock
          </Button>
        )}

        {/* Replace Asset */}
        {canReplace && (
          <Button
            variant="outline"
            size="sm"
            onClick={openReplaceModal}
            className="flex items-center gap-1.5 text-purple-700 border-purple-200 hover:bg-purple-50"
          >
            <span>🔄</span> Replace Asset
          </Button>
        )}

        {/* Report Lost */}
        {canReportLost && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLostOpen(true)}
            className="flex items-center gap-1.5 text-rose-700 border-rose-200 hover:bg-rose-50"
          >
            <span>⚠️</span> Report Lost
          </Button>
        )}

        {/* Recover */}
        {canRecover && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setRecoverOpen(true)}
            className="flex items-center gap-1.5"
          >
            <span>🔍</span> Recover Asset
          </Button>
        )}

        {/* Retire */}
        {canRetire && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setRetireOpen(true)}
            className="text-slate-500 hover:text-rose-600 hover:bg-rose-50"
          >
            <span>🗑️</span> Retire
          </Button>
        )}

        {asset.status === 'RETIRED' && (
          <span className="text-xs text-slate-400 italic">
            This asset is permanently retired. No further lifecycle operations permitted.
          </span>
        )}
      </div>

      {/* 1. Assign Modal */}
      <AssignAssetModal
        isOpen={assignOpen}
        onClose={() => setAssignOpen(false)}
        asset={asset}
        onAssigned={onAssetUpdated}
      />

      {/* 2. Unassign Confirmation Modal */}
      <Modal
        isOpen={unassignOpen}
        onClose={() => setUnassignOpen(false)}
        title="Unassign Asset"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            Are you sure you want to unassign <strong>{asset.name}</strong> ({asset.assetTag}) from{' '}
            <strong>{asset.assignedTo?.name || 'current user'}</strong>? The asset will return to
            the AVAILABLE pool.
          </p>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Unassignment Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={actionNotes}
              onChange={(e) => setActionNotes(e.target.value)}
              placeholder="e.g. Employee changed role or returned hardware..."
              className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setUnassignOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={loadingAction}
              onClick={() =>
                executeAction(
                  () => assetService.unassignAsset(asset._id, { notes: actionNotes }),
                  'Asset unassigned successfully.',
                  () => setUnassignOpen(false)
                )
              }
            >
              Confirm Unassign
            </Button>
          </div>
        </div>
      </Modal>

      {/* 3. Send For Repair Modal */}
      <Modal
        isOpen={repairOpen}
        onClose={() => setRepairOpen(false)}
        title="Send Asset for Repair"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            Record maintenance or warranty dispatch for <strong>{asset.assetTag}</strong>. Current status will change to <strong>UNDER_REPAIR</strong>.
          </p>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Issue / Repair Description <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={actionNotes}
              onChange={(e) => setActionNotes(e.target.value)}
              placeholder="e.g. Broken motherboard hinge, battery swelling, RMA ticket #..."
              required
              className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setRepairOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="warning"
              size="sm"
              loading={loadingAction}
              disabled={!actionNotes.trim()}
              onClick={() =>
                executeAction(
                  () => assetService.sendForRepair(asset._id, { notes: actionNotes }),
                  'Asset marked as under repair.',
                  () => setRepairOpen(false)
                )
              }
            >
              Dispatch for Repair
            </Button>
          </div>
        </div>
      </Modal>

      {/* 4. Return From Repair Modal */}
      <Modal
        isOpen={returnRepairOpen}
        onClose={() => setReturnRepairOpen(false)}
        title="Return Asset from Repair"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            Confirm that repairs for <strong>{asset.assetTag}</strong> are complete. The asset will be verified and returned to <strong>AVAILABLE</strong> stock.
          </p>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Resolution / Service Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={actionNotes}
              onChange={(e) => setActionNotes(e.target.value)}
              placeholder="e.g. Battery replaced under warranty, passed diagnostics..."
              className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setReturnRepairOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={loadingAction}
              onClick={() =>
                executeAction(
                  () => assetService.returnFromRepair(asset._id, { notes: actionNotes }),
                  'Asset returned to available stock.',
                  () => setReturnRepairOpen(false)
                )
              }
            >
              Confirm Return
            </Button>
          </div>
        </div>
      </Modal>

      {/* 5. Replace Asset Modal */}
      <Modal
        isOpen={replaceOpen}
        onClose={() => setReplaceOpen(false)}
        title="Replace Asset"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            Mark <strong>{asset.assetTag}</strong> as <strong>REPLACED</strong>. You may optionally select an available asset to automatically assign to the previous owner.
          </p>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Replacement Unit (Optional Available Asset)
            </label>
            <select
              value={replacementAssetId}
              onChange={(e) => setReplacementAssetId(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="">-- No replacement unit (Retire as replaced only) --</option>
              {availableAssets.map((cand) => (
                <option key={cand._id} value={cand._id}>
                  {cand.assetTag} - {cand.name} ({cand.category})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Replacement Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={actionNotes}
              onChange={(e) => setActionNotes(e.target.value)}
              placeholder="e.g. Issued upgraded model under tech refresh cycle..."
              className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setReplaceOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={loadingAction}
              onClick={() =>
                executeAction(
                  () =>
                    assetService.replaceAsset(asset._id, {
                      replacementAssetId: replacementAssetId || undefined,
                      notes: actionNotes,
                    }),
                  'Asset marked as replaced.',
                  () => setReplaceOpen(false)
                )
              }
            >
              Confirm Replacement
            </Button>
          </div>
        </div>
      </Modal>

      {/* 6. Report Lost Modal */}
      <Modal
        isOpen={lostOpen}
        onClose={() => setLostOpen(false)}
        title="Report Asset as Lost / Stolen"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800">
            <strong>Security Warning:</strong> Reporting an asset lost triggers an incident alert to IT Managers and SecOps.
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Circumstances / Police Report / Incident Details <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={actionNotes}
              onChange={(e) => setActionNotes(e.target.value)}
              placeholder="Date, location, police report reference or circumstances of loss..."
              required
              className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setLostOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              loading={loadingAction}
              disabled={!actionNotes.trim()}
              onClick={() =>
                executeAction(
                  () => assetService.reportLost(asset._id, { notes: actionNotes }),
                  'Asset reported as lost. Security alert dispatched.',
                  () => setLostOpen(false)
                )
              }
            >
              Report Lost
            </Button>
          </div>
        </div>
      </Modal>

      {/* 7. Recover Asset Modal */}
      <Modal
        isOpen={recoverOpen}
        onClose={() => setRecoverOpen(false)}
        title="Recover Lost Asset"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            Confirm that lost asset <strong>{asset.assetTag}</strong> has been recovered. It will be returned to <strong>AVAILABLE</strong> stock after verification.
          </p>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Recovery Verification Notes
            </label>
            <textarea
              rows={2}
              value={actionNotes}
              onChange={(e) => setActionNotes(e.target.value)}
              placeholder="e.g. Found in office conference room 4B, serial verified..."
              className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setRecoverOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={loadingAction}
              onClick={() =>
                executeAction(
                  () => assetService.recoverAsset(asset._id, { notes: actionNotes }),
                  'Asset recovered successfully.',
                  () => setRecoverOpen(false)
                )
              }
            >
              Confirm Recovery
            </Button>
          </div>
        </div>
      </Modal>

      {/* 8. Retire Asset Modal (Terminal state) */}
      <Modal
        isOpen={retireOpen}
        onClose={() => setRetireOpen(false)}
        title="Permanently Retire Asset"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900">
            <strong>Terminal Lifecycle Action:</strong> Retiring an asset permanently removes it from circulation and unassigns any current user. This action cannot be reversed.
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Retirement Reason / Disposal Details
            </label>
            <textarea
              rows={2}
              value={actionNotes}
              onChange={(e) => setActionNotes(e.target.value)}
              placeholder="e.g. End-of-life e-waste recycling, donor parts cannibalized..."
              className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setRetireOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              loading={loadingAction}
              onClick={() =>
                executeAction(
                  () => assetService.retireAsset(asset._id, { notes: actionNotes }),
                  'Asset permanently retired.',
                  () => setRetireOpen(false)
                )
              }
            >
              Permanently Retire
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default AssetActionBar
