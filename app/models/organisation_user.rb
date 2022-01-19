class OrganisationUser < ApplicationRecord

  has_paper_trail

  belongs_to :user
  belongs_to :organisation

  include Discard::Model

  scope :active, -> { where(discarded_at: nil) }
  scope :discarded, -> { where.not(discarded_at: nil) }

  delegate :name, to: :user, prefix: true



end
